import React from 'react';

import { AddCampaign } from './AddCampaign';

export default {
  title: 'Country Admin UI/blocks/AddCampaign',
  component: AddCampaign,
  argTypes: {},
};

const Template = (props) => <AddCampaign {...props} />;

export const Default = Template.bind({});
Default.args = {};
