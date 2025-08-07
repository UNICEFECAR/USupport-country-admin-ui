import React from "react";
import { useTranslation } from "react-i18next";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { Page, AddCampaign as AddCampaignBlock } from "#blocks";

import "./edit-campaign.scss";

/**
 * EditCampaign
 *
 * Edit campaign page
 *
 * @returns {JSX.Element}
 */
export const EditCampaign = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation("pages", { keyPrefix: "edit-campaign-page" });

  // const sponsorId = new URLSearchParams(window.location.search).get(
  //   "sponsorId"
  // );
  const campaignId = new URLSearchParams(window.location.search).get(
    "campaignId"
  );

  const sponsorName = location.state?.sponsorName;
  const campaignData = location.state?.campaignData;

  if (!campaignId) return <Navigate to="/campaigns" />;

  return (
    <Page
      heading={t("heading", { sponsorName })}
      handleGoBack={() => navigate(-1)}
      classes="page__edit-campaign"
    >
      <AddCampaignBlock
        sponsorName={sponsorName}
        campaignData={campaignData}
        campaignId={campaignId}
        isEdit
      />
    </Page>
  );
};
