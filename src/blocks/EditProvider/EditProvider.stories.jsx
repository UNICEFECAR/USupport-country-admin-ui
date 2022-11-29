import React from 'react';

import { EditProvider } from './EditProvider';

export default {
  title: 'Country Admin UI/blocks/EditProvider',
  component: EditProvider,
  argTypes: {},
};

const Template = (props) => <EditProvider {...props} />;

export const Default = Template.bind({});
Default.args = {};
