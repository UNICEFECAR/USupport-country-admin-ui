import { useTranslation } from "react-i18next";
import React from "react";

import { Analytics as AnalyticsBlock, Page } from "#blocks";

import "./analytics.scss";

/**
 * Analytics
 *
 * Analytics page
 *
 * @returns {JSX.Element}
 */
export const Analytics = () => {
  const { t } = useTranslation("pages", { keyPrefix: "analytics-page" });

  return (
    <Page
      classes="page__analytics"
      heading={t("heading")}
      showGoBackArrow={false}
    >
      <AnalyticsBlock />
    </Page>
  );
};
