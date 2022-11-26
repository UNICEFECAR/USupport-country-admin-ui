import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AdminProfile } from "./AdminProfile";

export default {
  title: "Client UI/pages/AdminProfile",
  component: AdminProfile,
  argTypes: {},
};

const Template = (props) => (
  <Router>
    <AdminProfile {...props} />
  </Router>
);

export const Default = Template.bind({});
Default.args = {};
