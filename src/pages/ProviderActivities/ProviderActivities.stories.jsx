import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ProviderActivities } from './ProviderActivities';

export default {
    title: 'Country Admin UI/pages/ProviderActivities',
    component: ProviderActivities,
    argTypes: {},
};

const Template = (props) => <Router><ProviderActivities {...props} /></Router>;

export const Default = Template.bind({});
Default.args = {}; 
