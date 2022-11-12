import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Articles } from "./Articles";

export default {
  title: "Country Admin UI/blocks/Articles",
  component: Articles,
  argTypes: {},
};

// Create a react-query client
const queryClient = new QueryClient();

const Template = (props) => (
  <QueryClientProvider client={queryClient}>
    <Articles {...props} />
  </QueryClientProvider>
);

export const Default = Template.bind({});
Default.args = {};
