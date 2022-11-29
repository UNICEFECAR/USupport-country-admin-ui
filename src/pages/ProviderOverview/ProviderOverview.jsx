import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Page, ProviderOverview as ProviderOverviewBlock } from "#blocks";
import { useWindowDimensions } from "@USupport-components-library/src/utils";
import { RadialCircle, Button } from "@USupport-components-library/src";

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
        }}
      />
      <div className="page__provider-overview__button-container">
        <Button
          label={t("button_label")}
          color="purple"
          size="md"
          onClick={handleEditRedirect}
        />
      </div>
      {width < 768 && <RadialCircle />}
    </Page>
  );
};
