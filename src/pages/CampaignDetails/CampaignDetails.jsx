import React from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { Page, CampaignDetails as CampaignDetailsBlock } from "#blocks";

import "./campaign-details.scss";

/**
 * CampaignDetails
 *
 * Campaign details page
 *
 * @returns {JSX.Element}
 */
export const CampaignDetails = () => {
  const { t } = useTranslation("campaign-details-page");
  const navigate = useNavigate();
  const location = useLocation();

  const sponsorId = new URLSearchParams(window.location.search).get(
    "sponsorId"
  );

  const campaignId = new URLSearchParams(window.location.search).get(
    "campaignId"
  );
  const sponsorName = location.state?.sponsorName;
  const campaignName = location.state?.campaignName;

  return (
    <Page
      heading={`${sponsorName} / ${campaignName}`}
      classes="page__campaign-details"
      handleGoBack={() => navigate(-1)}
    >
      <CampaignDetailsBlock campaignId={campaignId} />
    </Page>
  );
};
