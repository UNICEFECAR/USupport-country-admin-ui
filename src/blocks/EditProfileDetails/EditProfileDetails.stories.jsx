import React from 'react';

import { EditProfileDetails } from './EditProfileDetails';

export default {
  title: 'Provider UI/blocks/EditProfileDetails',
  component: EditProfileDetails,
  argTypes: {},
};

const Template = (props) => <EditProfileDetails {...props} />;

export const Default = Template.bind({});
Default.args = {};
