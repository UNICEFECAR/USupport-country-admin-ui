import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { EditCampaign } from './EditCampaign';

export default {
    title: 'Country Admin UI/pages/EditCampaign',
    component: EditCampaign,
    argTypes: {},
};

const Template = (props) => <Router><EditCampaign {...props} /></Router>;

export const Default = Template.bind({});
Default.args = {}; 
