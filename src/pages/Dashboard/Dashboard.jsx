import React from "react";
import { useTranslation } from "react-i18next";
import { Page, Statistics } from "#blocks";
import { useWindowDimensions } from "@USupport-components-library/src/utils";
import { RadialCircle } from "@USupport-components-library/src";

import "./dashboard.scss";
import { Navigate } from "react-router-dom";

/**
 * Dashboard
 *
 * Dashboard page
 *
 * @returns {JSX.Element}
 */
export const Dashboard = () => {
  const { t } = useTranslation("pages", { keyPrefix: "dashboard-page" });
  const { width } = useWindowDimensions();

  const country = localStorage.getItem("country");

  const IS_PS = country === "PS";

  if (IS_PS) {
    return (
      <Navigate
        to={`/country-admin/${localStorage.getItem(
          "language"
        )}/content-management?tab=articles`}
      />
    );
  }

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
