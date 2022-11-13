import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SOSCenter } from "./SOSCenter";

export default {
  title: "Country Admin UI/blocks/SOSCenter",
  component: SOSCenter,
  argTypes: {},
};

// Create a react-query client
const queryClient = new QueryClient();

const Template = (props) => (
  <QueryClientProvider client={queryClient}>
    <SOSCenter {...props} />
  </QueryClientProvider>
);

export const Default = Template.bind({});
Default.args = {};
