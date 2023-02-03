import React from 'react';

import { AddSponsor } from './AddSponsor';

export default {
  title: 'Country Admin UI/blocks/AddSponsor',
  component: AddSponsor,
  argTypes: {},
};

const Template = (props) => <AddSponsor {...props} />;

export const Default = Template.bind({});
Default.args = {};
