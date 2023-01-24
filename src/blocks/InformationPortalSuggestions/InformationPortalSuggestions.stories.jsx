import React from 'react';

import { InformationPortalSuggestions } from './InformationPortalSuggestions';

export default {
  title: 'Country Admin UI/blocks/InformationPortalSuggestions',
  component: InformationPortalSuggestions,
  argTypes: {},
};

const Template = (props) => <InformationPortalSuggestions {...props} />;

export const Default = Template.bind({});
Default.args = {};
