import React from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, Navigate } from "react-router-dom";

import { Page, CampaignDetails as CampaignDetailsBlock } from "#blocks";

const AMAZON_S3_BUCKET = `${import.meta.env.VITE_AMAZON_S3_BUCKET}`;

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
  const sponsorImage = location.state?.sponsorImage;
  const campaignData = location.state?.campaignData;

  if (!campaignId || !campaignData) return <Navigate to="/sponsors" />;

  return (
    <Page
      heading={`${sponsorName} / ${campaignData.name}`}
      image={sponsorImage ? `${AMAZON_S3_BUCKET}/${sponsorImage}` : null}
      classes="page__campaign-details"
      handleGoBack={() => navigate(-1)}
    >
      <CampaignDetailsBlock campaignId={campaignId} data={campaignData} />
    </Page>
  );
};
