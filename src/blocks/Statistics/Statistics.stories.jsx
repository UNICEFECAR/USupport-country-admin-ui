import React from 'react';

import { Statistics } from './Statistics';

export default {
  title: 'Country Admin UI/blocks/Statistics',
  component: Statistics,
  argTypes: {},
};

const Template = (props) => <Statistics {...props} />;

export const Default = Template.bind({});
Default.args = {};
