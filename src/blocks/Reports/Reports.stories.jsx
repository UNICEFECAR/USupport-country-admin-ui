import React from 'react';

import { Reports } from './Reports';

export default {
  title: 'Country Admin UI/blocks/Reports',
  component: Reports,
  argTypes: {},
};

const Template = (props) => <Reports {...props} />;

export const Default = Template.bind({});
Default.args = {};
