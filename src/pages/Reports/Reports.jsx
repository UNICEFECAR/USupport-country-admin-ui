import React from "react";
import { useTranslation } from "react-i18next";
import { Page, Reports as ReportsBlock } from "#blocks";

import "./reports.scss";

/**
 * Reports
 *
 * Reports page
 *
 * @returns {JSX.Element}
 */
export const Reports = () => {
  const { t } = useTranslation("reports-page");
  return (
    <Page
      classes="page__reports"
      heading={t("heading")}
      showGoBackArrow={false}
    >
      <ReportsBlock />
    </Page>
  );
};
