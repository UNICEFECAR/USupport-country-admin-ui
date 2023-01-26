import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, Navigate, useLocation } from "react-router-dom";

import { Page, ProviderActivities as ProviderActivitiesBlock } from "#blocks";

import "./provider-activities.scss";

import { useGetProviderActivitiesById } from "#hooks";

/**
 * ProviderActivities
 *
 * Provider activities page
 *
 * @returns {JSX.Element}
 */
export const ProviderActivities = () => {
  const { t } = useTranslation("provider-activities-page");
  const navigate = useNavigate();
  const location = useLocation();

  const providerName = location.state?.providerName;

  const providerId = new URLSearchParams(window.location.search).get(
    "providerId"
  );

  const { isLoading, data } = useGetProviderActivitiesById(providerId);

  if (!providerId) return <Navigate to="/providers" />;

  return (
    <Page
      classes="page__provider-activities"
      heading={providerName || ""}
      handleGoBack={() => navigate(-1)}
    >
      <ProviderActivitiesBlock isLoading={isLoading} data={data} />
    </Page>
  );
};
