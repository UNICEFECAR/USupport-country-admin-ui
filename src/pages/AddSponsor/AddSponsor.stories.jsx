import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AddSponsor } from './AddSponsor';

export default {
    title: 'Country Admin UI/pages/AddSponsor',
    component: AddSponsor,
    argTypes: {},
};

const Template = (props) => <Router><AddSponsor {...props} /></Router>;

export const Default = Template.bind({});
Default.args = {}; 
