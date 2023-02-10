import React from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Page, AddCampaign as AddCampaignBlock } from "#blocks";

import "./add-campaign.scss";

/**
 * AddCampaign
 *
 * Add campaign page
 *
 * @returns {JSX.Element}
 */
export const AddCampaign = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("add-campaign-page");
  const sponsorId = new URLSearchParams(window.location.search).get(
    "sponsorId"
  );

  const location = useLocation();
  const sponsorName = location.state?.sponsorName;
  const sponsorImage = location.state?.sponsorImage;

  if (!sponsorId) return <Navigate to="/campaigns" />;

  return (
    <Page
      heading={t("heading", { sponsorName })}
      handleGoBack={() => navigate(-1)}
      classes="page__add-campaign"
    >
      <AddCampaignBlock
        sponsorId={sponsorId}
        sponsorName={sponsorName}
        sponsorImage={sponsorImage}
      />
    </Page>
  );
};
