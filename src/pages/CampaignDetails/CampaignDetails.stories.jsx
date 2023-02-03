import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { CampaignDetails } from './CampaignDetails';

export default {
    title: 'Country Admin UI/pages/CampaignDetails',
    component: CampaignDetails,
    argTypes: {},
};

const Template = (props) => <Router><CampaignDetails {...props} /></Router>;

export const Default = Template.bind({});
Default.args = {}; 
