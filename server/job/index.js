const bunyan = require('bunyan');
const log = bunyan.createLogger({ name: 'queueworker' });
const redis = require('redis');

const QueueEmitter = require('./emitter');
const Job = require('./job');

const ENV = process.env.NODE_ENV || 'development';
const REDIS_CONFIG = require('../config/redis')[ENV];

class QueueWorker {
  constructor(keys) {
    if (!Array.isArray(keys)) {
      throw new Error('keys should be Array');
    } else if (keys.length === 0) {
      throw new Error('keys is emnty.');
    }

    this.jobQueues = keys.map((key) => new QueueEmitter(key));
    this.redisSubscribe = redis.createClient(REDIS_CONFIG.url);
    this.redisSubscribe.subscribe(REDIS_CONFIG.channels.TX_HANDLER);

    this.redisSubscribe.on('error', (err) => {
      log.error('redis:', err);
    });
  }

  _toMin() {
    this.jobQueues.sort((jobA, jobB) => {
      return jobB.timestamp - jobA.timestamp;
    });
  }

  distributeTasks(tasks) {
    if (!Array.isArray(tasks)) {
      throw new Error('tasks should be Array');
    }

    this._toMin();

    for (let taskIndex = 0; taskIndex < tasks.length + this.jobQueues.length; taskIndex += this.jobQueues.length) {
      for (let queueIndex = 0; queueIndex < this.jobQueues.length; queueIndex++) {
        const task = tasks[taskIndex + queueIndex];

        if (task) {
          this.jobQueues[queueIndex].addTask(task);
        }
      }
    }
  }

  addTask(taskJob) {
    for (let index = 0; index < this.jobQueues.length; index++) {
      const job = this.jobQueues[index];

      if (job.queue.hasTask(taskJob)) {
        return null;
      }
    }

    this._toMin();
    this.jobQueues[0].addTask(taskJob);
  }

  addJobQueues(key) {
    if (!key) {
      throw new Error('Key is required');
    }

    const job = new QueueEmitter(key);

    this.jobQueues.push(job);

    return job;
  }
}

module.exports = {
  QueueWorker,
  QueueEmitter,
  Job,
  Queue: require('./queue')
};
