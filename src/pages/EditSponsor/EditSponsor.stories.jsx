import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { EditSponsor } from './EditSponsor';

export default {
    title: 'Country Admin UI/pages/EditSponsor',
    component: EditSponsor,
    argTypes: {},
};

const Template = (props) => <Router><EditSponsor {...props} /></Router>;

export const Default = Template.bind({});
Default.args = {}; 
