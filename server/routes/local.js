const express = require('express');
const { Op } = require('sequelize');
const { validation } = require('@zilliqa-js/util');
const checkSession = require('../middleware/check-session');
const zilliqa = require('../zilliqa');
const models = require('../models');
const verifyJwt = require('../middleware/verify-jwt');
const verifyCampaign = require('../middleware/campaign-check');
const blockchainCache = require('../middleware/blockchain-cache');

const router = express.Router();

const ERROR_CODES = require('../../config/error-codes');
const ENV = process.env.NODE_ENV || 'development';
const END_OF_CAMPAIGN = process.env.END_OF_CAMPAIGN;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const MAX_AMOUNT_NOTIFICATIONS = process.env.MAX_AMOUNT_NOTIFICATIONS || 3;
const REDIS_CONFIG = require('../config/redis')[ENV];
const JOB_TYPES = require('../config/job-types');

const dev = ENV !== 'production';
const {
  User,
  Twittes,
  blockchain,
  Notification,
  Admin
} = models.sequelize.models;

const actions = new User().actions;
const notificationTypes = new Notification().types;

if (!END_OF_CAMPAIGN) {
  throw new Error('ENV: END_OF_CAMPAIGN is required!!!');
}

router.put('/update/address/:address', checkSession, verifyJwt, verifyCampaign, async (req, res) => {
  const bech32Address = req.params.address;
  const { user } = req.verification;
  const { redis } = req.app.settings;

  try {
    if (!validation.isBech32(bech32Address)) {
      return res.status(401).json({
        code: ERROR_CODES.invalidAddressFormat,
        message: 'Invalid address format.'
      });
    }

    const userExist = await User.count({
      where: {
        zilAddress: bech32Address
      }
    });

    if (userExist > 0) {
      return res.status(401).json({
        code: ERROR_CODES.alreadyExists,
        message: 'This address is already registered.'
      });
    }

    await user.update({
      zilAddress: bech32Address,
      hash: null,
      synchronization: true,
      actionName: actions.configureUsers
    });

    redis.publish(REDIS_CONFIG.channels.TX_HANDLER, JSON.stringify({
      type: JOB_TYPES.configureUsers,
      userId: user.id
    }));

    const notification = await Notification.create({
      UserId: user.id,
      type: notificationTypes.addressConfiguring,
      title: 'Account',
      description: 'Syncing Address...'
    });

    redis.publish(REDIS_CONFIG.channels.WEB, JSON.stringify({
      model: Notification.tableName,
      body: notification
    }));

    delete user.dataValues.tokenSecret;
    delete user.dataValues.token;

    return res.status(201).json({
      user,
      message: 'ConfiguredUserAddress',
    });
  } catch (err) {
    if (dev) {
      return res.status(401).send(err.message || err);;
    }

    return res.status(401).json({
      code: ERROR_CODES.badRequest,
      message: 'Bad request.'
    });
  }
});

router.put('/sing/out', checkSession, (req, res) => {
  res.clearCookie(process.env.SESSION);
  res.clearCookie(`${process.env.SESSION}.sig`);
  res.clearCookie('io');

  return res.status(200).json({
    message: 'cleared'
  });
});

router.get('/get/tweets', checkSession, async (req, res) => {
  const UserId = req.session.passport.user.id;
  const limit = req.query.limit || 3;
  const offset = req.query.offset || 0;

  try {
    const count = await Twittes.count({
      where: {
        UserId
      }
    });
    const verifiedCount = await Twittes.count({
      where: {
        UserId,
        approved: true
      }
    });
    const lastActionTweet = await zilliqa.getLastWithdrawal([
      req.session.passport.user.profileId
    ]);
    const tweets = await Twittes.findAll({
      limit,
      offset,
      order: [
        ['createdAt', 'DESC']
      ],
      where: {
        UserId
      },
      attributes: {
        exclude: [
          'text',
          'updatedAt'
        ]
      }
    });

    return res.status(200).json({
      tweets,
      count,
      verifiedCount,
      lastBlockNumber: !lastActionTweet ? 0 : Number(lastActionTweet) + 1
    });
  } catch (err) {
    if (dev) {
      return res.status(401).send(err.message || err);;
    }

    return res.status(401).json({
      code: ERROR_CODES.badRequest,
      message: 'Bad request.'
    });
  }
});

router.get('/get/blockchain', blockchainCache, async (req, res) => {
  return res.status(200).json(req.blockchainInfo);
});

router.get('/get/notifications', checkSession, async (req, res) => {
  const UserId = req.session.passport.user.id;
  const limit = isNaN(req.query.limit) ? MAX_AMOUNT_NOTIFICATIONS : req.query.limit;
  const offset = req.query.offset || 0;

  try {
    const notificationCount = await Notification.count({
      where: {
        UserId
      }
    });
    const userNotification = await Notification.findAll({
      limit,
      offset,
      where: {
        UserId
      },
      order: [
        ['createdAt', 'DESC']
      ],
      attributes: {
        exclude: [
          'updatedAt'
        ]
      }
    });

    return res.status(200).json({
      limit: Number(limit),
      notification: userNotification,
      count: Number(notificationCount)
    });
  } catch (err) {
    if (dev) {
      return res.status(401).send(err.message || err);;
    }

    return res.status(401).json({
      code: ERROR_CODES.badRequest,
      message: 'Bad request.'
    });
  }
});

router.delete('/delete/notifications', checkSession, verifyJwt, async (req, res) => {
  const { user } = req.verification;

  try {
    await Notification.destroy({
      where: {
        UserId: user.id
      }
    });

    return res.status(204);
  } catch (err) {
    if (dev) {
      return res.status(401).send(err.message || err);;
    }

    return res.status(401).json({
      code: ERROR_CODES.badRequest,
      message: 'Bad request.'
    });
  }
});

router.get('/get/accounts', checkSession, async (req, res) => {
  const accounts = await Admin.findAll({
    attributes: [
      'bech32Address',
      'address',
      'balance',
      'status',
      'nonce'
    ]
  });

  return res.json(accounts);
});

router.get('/get/stats', checkSession, async (req, res) => {
  const paddingTweet = await Twittes.findAndCountAll({
    where: {
      approved: false,
      rejected: false,
      claimed: true
    }
  });
  const approvedTweet = await Twittes.count({
    where: {
      approved: true,
      rejected: false,
      claimed: true
    }
  });
  const tweets = await Twittes.count();
  const paddingUsers = await User.count({
    where: {
      synchronization: true,
      zilAddress: {
        [Op.not]: null
      }
    }
  });
  const registeredUsers = await User.count({
    where: {
      synchronization: false,
      zilAddress: {
        [Op.not]: null
      }
    }
  });

  return res.json({
    paddingTweet,
    paddingUsers,
    registeredUsers,
    approvedTweet,
    tweets
  });
});

module.exports = router;
