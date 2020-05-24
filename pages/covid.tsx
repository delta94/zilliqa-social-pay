import React from 'react';
import { NextPage } from 'next';
import styled from 'styled-components';
import * as Effector from 'effector-react';

import BrowserStore from 'store/browser';

import { Text } from 'components/text';
import { KeentodoMore } from 'components/keentodo-more';
import { Img } from 'components/img';

import { PageProp } from 'interfaces';
import {
  FontColors,
  FontSize,
  Fonts,
  Sides
} from 'config';

type CovidPageContainerProp = {
  format: string;
};

const CovidPageContainer = styled.main`
  display: flex;
  align-items: center;
  justify-content: space-evenly;

  background-color: rgba(56, 89, 255, 0.86);
  background-image: url(/imgs/map.${(props: CovidPageContainerProp) => props.format});
  background-repeat:no-repeat;
  background-position: center center;

  width: 100%;
  height: 100%;
  min-height: 100vh;

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;
const Linkbutton = styled(KeentodoMore)`
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin: 0;
  background-color: #526EFF;
  box-shadow: 5px 7px 12px 2px rgba(0,0,0,0.4);
`;
const LinkContainer = styled.a`
  text-decoration: unset;
  color: unset;
`;
const Illustration = styled(Img)`
  width: 100px;
  height: 200px;

  @media (max-width: 401px) {
    width: 50px;
    height: 100px;
  }
`;

export const CovidPage: NextPage<PageProp> = () => {
  const browserState = Effector.useStore(BrowserStore.store);

  return (
    <CovidPageContainer format={browserState.format}>
      <LinkContainer href="https://nextid.com/covidheroes/">
        <Linkbutton>
          <Illustration
            src="/icons/medal.svg"
            css="width: 70px;"
          />
          <Text
            size={FontSize.md}
            fontVariant={Fonts.AvenirNextLTProDemi}
            fontColors={FontColors.white}
          >
            Recognice COVIDHeroes
          </Text>
          <Text
            fontVariant={Fonts.AvenirNextLTProRegular}
            fontColors={FontColors.white}
            align={Sides.center}
            css="font-size: 14px;"
          >
            Many out there are stepping up to serve their community in this fight against Covid-19.
            Give these heroes and heroines a shout-out via by generating and sharing with them a personalised, blockchain-powered certificate of recognition for their efforts.
          </Text>
        </Linkbutton>
      </LinkContainer>
      <LinkContainer href="https://redcross.give.asia/campaign/essentials-delivered-to-migrant-workers/donate?#/amount">
        <Linkbutton>
          <Illustration src="/icons/hand.svg" />
          <Text
            size={FontSize.md}
            fontVariant={Fonts.AvenirNextLTProDemi}
            fontColors={FontColors.white}
          >
            COVID Relief fund
          </Text>
          <Text
            fontVariant={Fonts.AvenirNextLTProRegular}
            fontColors={FontColors.white}
            align={Sides.center}
            css="font-size: 14px;"
          >
            Support Red Cross Singapore in their fight against Covid-19.&nbsp;
            The aim of this campaign is to raise funds to help offset&nbsp;
            the operation costs of islandwide delivery of essentials&nbsp;
            to our migrant worker community, so that they can stay&nbsp;
            <Text
              fontVariant={Fonts.AvenirNextLTProDemi}
              fontColors={FontColors.white}
              align={Sides.center}
              css="font-size: 14px;margin: 0;"
            >
              safe and protect themselves
            </Text>&nbsp;
            as best as possible.
          </Text>
        </Linkbutton>
      </LinkContainer>
    </CovidPageContainer>
  );
};

export default CovidPage;