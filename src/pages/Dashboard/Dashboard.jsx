import React from "react";
import { Page, Statistics } from "#blocks";
import { useWindowDimensions } from "@USupport-components-library/src/utils";
import { RadialCircle } from "@USupport-components-library/src";

import "./dashboard.scss";

/**
 * Dashboard
 *
 * Dashboard page
 *
 * @returns {JSX.Element}
 */
export const Dashboard = () => {
  const { width } = useWindowDimensions();

  return (
    <Page classes="page__dashboard">
      <Statistics />
      {width > 768 ? <RadialCircle /> : null}
    </Page>
  );
};
