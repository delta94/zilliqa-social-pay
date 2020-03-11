import 'react-responsive-carousel/lib/styles/carousel.min.css';

import { createGlobalStyle } from 'styled-components';
import Head from 'next/head';
import App from 'next/app';

import UserStore from 'store/user';

import { Container } from 'components/container';
import { FixedWrapper } from 'components/fixed-wrapper';

import { Fonts } from 'config';

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: ${Fonts.AvenirNextLTProBold};
    src: url('/fonts/AvenirNextLTPro-Bold.otf');
  }
  @font-face {
    font-family: ${Fonts.AvenirNextLTProDemi};
    src: url('/fonts/AvenirNextLTPro-Demi.otf');
  }
  @font-face {
    font-family: ${Fonts.AvenirNextLTProDemiIt};
    src: url('/fonts/AvenirNextLTPro-DemiIt.otf');
  }
  @font-face {
    font-family: ${Fonts.AvenirNextLTProHeavyCn};
    src: url('/fonts/AvenirNextLTPro-HeavyCn.otf');
  }
  @font-face {
    font-family: ${Fonts.AvenirNextLTProIt};
    src: url('/fonts/AvenirNextLTPro-It.otf');
  }
  @font-face {
    font-family: ${Fonts.AvenirNextLTProRegular};
    src: url('/fonts/AvenirNextLTPro-Regular.otf');
  }

  body, html {
    margin: 0;
    padding: 0;

    font-family: ${Fonts.AvenirNextLTProRegular};
  }

  * {
    box-sizing: border-box;
  }

  @keyframes fadeInUp {
    from {
      transform: translate3d(0, 100%, 0);
    }

    to {
      transform: translate3d(0, 0, 0);
    }
  }

  @keyframes fade {
    from {
      opacity: 0;
    }

    to {
      opacity: 0.5;
    }
  }
`;

class SocialPay extends App {
  public componentDidMount() {
    UserStore.update();

    const state = UserStore.store.getState();

    if (!this.props.pageProps.user || !state || !state.jwtToken) {
      if (this.props.pageProps.firstStart) {
        return this.props.router.push('/guide');
      }

      this.props.router.push('/auth');
    }
  }

  public render() {
    const { Component, pageProps } = this.props;

    return (
      <Container>
        <Head>
          <title>SocialPay</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="shortcut icon" href="/favicon.ico" />
        </Head>
        <GlobalStyle />
        <Component {...pageProps} />
        <FixedWrapper />
      </Container>
    );
  }
}

SocialPay.getInitialProps = async ({ ctx }: any) => {
  let firstStart = true;

  if (!ctx || !ctx.req || !ctx.req.app) {
    return {
      pageProps: {
        user: null,
        firstStart: false
      }
    };
  }

  if (ctx.req.cookies && (ctx.req.cookies['session.sig'] || ctx.req.cookies['session'])) {
    firstStart = false;
  }

  if (ctx && ctx.req && ctx.req.session && ctx.req.session.passport) {
    return {
      pageProps: {
        ...ctx.req.session.passport,
        firstStart
      }
    };
  }

  return {
    pageProps: {
      firstStart,
      user: null
    }
  };
};

export default SocialPay;