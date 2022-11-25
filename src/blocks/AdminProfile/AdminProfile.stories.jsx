import React from "react";

import { AdminProfile } from "./AdminProfile";

export default {
  title: "Client UI/blocks/AdminProfile",
  component: AdminProfile,
  argTypes: {},
};

const Template = (props) => <AdminProfile {...props} />;

export const Default = Template.bind({});
Default.args = {};
