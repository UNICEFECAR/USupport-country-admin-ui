import React from 'react';

import { CampaignDetails } from './CampaignDetails';

export default {
  title: 'Country Admin UI/blocks/CampaignDetails',
  component: CampaignDetails,
  argTypes: {},
};

const Template = (props) => <CampaignDetails {...props} />;

export const Default = Template.bind({});
Default.args = {};
