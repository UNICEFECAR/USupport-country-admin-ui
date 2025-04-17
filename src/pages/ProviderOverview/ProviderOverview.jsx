import React from "react";
import { useTranslation } from "react-i18next";
import { useCustomNavigate as useNavigate } from "#hooks";
import { Page, ProviderOverview as ProviderOverviewBlock } from "#blocks";
import { useWindowDimensions } from "@USupport-components-library/src/utils";
import { RadialCircle } from "@USupport-components-library/src";

import "./provider-overview.scss";

/**
 * ProviderOverview
 *
 * ProviderOverview page
 *
 * @returns {JSX.Element}
 */
export const ProviderOverview = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("provider-overview-page");
  const { width } = useWindowDimensions();

  const providerId = new URLSearchParams(window.location.search).get("id");

  const handleGoBack = () => navigate(-1);
  const handleEditRedirect = () => {
    navigate(`/edit-provider?id=${providerId}`);
  };
  return (
    <Page
      classes="page__provider-overview"
      heading={t("heading")}
      handleGoBack={handleGoBack}
    >
      <ProviderOverviewBlock
        {...{
          providerId,
          handleEditRedirect,
        }}
      />
      {width < 768 && <RadialCircle />}
    </Page>
  );
};
