import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { EditProfileDetails } from './EditProfileDetails';

export default {
    title: 'Provider UI/pages/EditProfileDetails',
    component: EditProfileDetails,
    argTypes: {},
};

const Template = (props) => <Router><EditProfileDetails {...props} /></Router>;

export const Default = Template.bind({});
Default.args = {}; 
