import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AddCampaign } from './AddCampaign';

export default {
    title: 'Country Admin UI/pages/AddCampaign',
    component: AddCampaign,
    argTypes: {},
};

const Template = (props) => <Router><AddCampaign {...props} /></Router>;

export const Default = Template.bind({});
Default.args = {}; 
