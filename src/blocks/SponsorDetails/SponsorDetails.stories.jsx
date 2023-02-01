import React from 'react';

import { SponsorDetails } from './SponsorDetails';

export default {
  title: 'Country Admin UI/blocks/SponsorDetails',
  component: SponsorDetails,
  argTypes: {},
};

const Template = (props) => <SponsorDetails {...props} />;

export const Default = Template.bind({});
Default.args = {};
