import React from 'react';

import { CreateProvider } from './CreateProvider';

export default {
  title: 'Country Admin UI/blocks/CreateProvider',
  component: CreateProvider,
  argTypes: {},
};

const Template = (props) => <CreateProvider {...props} />;

export const Default = Template.bind({});
Default.args = {};
