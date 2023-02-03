import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Campaigns } from './Campaigns';

export default {
    title: 'Country Admin UI/pages/Campaigns',
    component: Campaigns,
    argTypes: {},
};

const Template = (props) => <Router><Campaigns {...props} /></Router>;

export const Default = Template.bind({});
Default.args = {}; 
