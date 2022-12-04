import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { CreateProvider } from './CreateProvider';

export default {
    title: 'Country Admin UI/pages/CreateProvider',
    component: CreateProvider,
    argTypes: {},
};

const Template = (props) => <Router><CreateProvider {...props} /></Router>;

export const Default = Template.bind({});
Default.args = {}; 
