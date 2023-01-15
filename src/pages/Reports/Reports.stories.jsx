import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Reports } from './Reports';

export default {
    title: 'Country Admin UI/pages/Reports',
    component: Reports,
    argTypes: {},
};

const Template = (props) => <Router><Reports {...props} /></Router>;

export const Default = Template.bind({});
Default.args = {}; 
