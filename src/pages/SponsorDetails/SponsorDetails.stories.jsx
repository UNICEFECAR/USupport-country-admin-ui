import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { SponsorDetails } from './SponsorDetails';

export default {
    title: 'Country Admin UI/pages/SponsorDetails',
    component: SponsorDetails,
    argTypes: {},
};

const Template = (props) => <Router><SponsorDetails {...props} /></Router>;

export const Default = Template.bind({});
Default.args = {}; 
