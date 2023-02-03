import React from 'react';

import { ProviderActivities } from './ProviderActivities';

export default {
  title: 'Country Admin UI/blocks/ProviderActivities',
  component: ProviderActivities,
  argTypes: {},
};

const Template = (props) => <ProviderActivities {...props} />;

export const Default = Template.bind({});
Default.args = {};
