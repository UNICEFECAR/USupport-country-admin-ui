import React from "react";

import { MyQAReports } from "./MyQAReports";

export default {
  title: "Country Admin UI/blocks/MyQA",
  component: MyQAReports,
  argTypes: {},
};

const Template = (props) => <MyQAReports {...props} />;

export const Default = Template.bind({});
Default.args = {};
