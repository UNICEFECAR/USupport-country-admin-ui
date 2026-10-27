import React from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Page,
  ConsultationProblemReportDetails as ConsultationProblemReportDetailsBlock,
} from "#blocks";
import { useGetConsultationProblemReport, useCustomNavigate } from "#hooks";

import "./consultation-problem-report-details.scss";

/**
 * ConsultationProblemReportDetails
 *
 * Page wrapper for a single consultation problem report
 *
 * @returns {JSX.Element}
 */
export const ConsultationProblemReportDetails = () => {
  const { reportId, language } = useParams();
  const navigate = useCustomNavigate();
  const query = useGetConsultationProblemReport(reportId);
  const { t } = useTranslation("pages", {
    keyPrefix: "consultation-problem-report-details-page",
  });

  return (
    <Page
      heading={t("detail_title")}
      classes="page__consultation-problem-report-details"
      handleGoBack={() => navigate("/reports?tab=consultation_problems")}
    >
      <ConsultationProblemReportDetailsBlock
        report={query.data}
        isLoading={query.isLoading}
        isError={query.isError}
        onRetry={() => query.refetch()}
        locale={language}
      />
    </Page>
  );
};
