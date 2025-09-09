import React from "react";
import { useTranslation } from "react-i18next";
import { Page, BaselineAssessmentThresholds } from "#blocks";

import "./baseline-assessment.scss";

/**
 * BaselineAssessment
 *
 * Baseline Assessment Thresholds management page
 *
 * @returns {JSX.Element}
 */
export const BaselineAssessment = () => {
  const { t } = useTranslation("pages", {
    keyPrefix: "baseline-assessment-page",
  });

  return (
    <Page
      classes="page__baseline-assessment"
      showGoBackArrow={true}
      heading={t("heading")}
    >
      <BaselineAssessmentThresholds />
    </Page>
  );
};
