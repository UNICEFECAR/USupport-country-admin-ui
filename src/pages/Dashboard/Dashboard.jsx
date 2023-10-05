import React from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("dashboard-page");
  const { width } = useWindowDimensions();

  return (
    <Page
      classes="page__dashboard"
      showGoBackArrow={false}
      heading={t("heading")}
    >
      <Statistics />
      {width > 768 ? <RadialCircle /> : null}
    </Page>
  );
};
