import React from 'react';

import { SecurityCheck } from './SecurityCheck';

export default {
  title: 'Country Admin UI/blocks/SecurityCheck',
  component: SecurityCheck,
  argTypes: {},
};

const Template = (props) => <SecurityCheck {...props} />;

export const Default = Template.bind({});
Default.args = {};
