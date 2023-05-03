import React from "react";

import { MyQA } from "./MyQA";

export default {
  title: "Country Admin UI/blocks/MyQA",
  component: MyQA,
  argTypes: {},
};

const Template = (props) => <MyQA {...props} />;

export const Default = Template.bind({});
Default.args = {};
