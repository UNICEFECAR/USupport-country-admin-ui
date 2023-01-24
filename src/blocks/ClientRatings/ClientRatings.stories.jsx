import React from 'react';

import { ClientRatings } from './ClientRatings';

export default {
  title: 'Country Admin UI/blocks/ClientRatings',
  component: ClientRatings,
  argTypes: {},
};

const Template = (props) => <ClientRatings {...props} />;

export const Default = Template.bind({});
Default.args = {};
