import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { EditProvider } from './EditProvider';

export default {
    title: 'Country Admin UI/pages/EditProvider',
    component: EditProvider,
    argTypes: {},
};

const Template = (props) => <Router><EditProvider {...props} /></Router>;

export const Default = Template.bind({});
Default.args = {}; 
