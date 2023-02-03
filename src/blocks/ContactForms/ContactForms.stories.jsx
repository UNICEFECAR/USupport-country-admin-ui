import React from 'react';

import { ContactForms } from './ContactForms';

export default {
  title: 'Country Admin UI/blocks/ContactForms',
  component: ContactForms,
  argTypes: {},
};

const Template = (props) => <ContactForms {...props} />;

export const Default = Template.bind({});
Default.args = {};
