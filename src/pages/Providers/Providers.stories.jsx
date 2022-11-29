import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Providers } from './Providers';

export default {
    title: 'Country Admin UI/pages/Providers',
    component: Providers,
    argTypes: {},
};

const Template = (props) => <Router><Providers {...props} /></Router>;

export const Default = Template.bind({});
Default.args = {}; 
