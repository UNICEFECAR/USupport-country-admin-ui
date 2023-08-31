import React from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";

import { Loading } from "@USupport-components-library/src";

import { Page, CampaignDetails as CampaignDetailsBlock } from "#blocks";
import { useGetCampaignDataById } from "#hooks";

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

  const { data: campaignData, isLoading } = useGetCampaignDataById(campaignId);

  if (!campaignId) return <Navigate to="/sponsors" />;

  return (
    <Page
      heading={`${sponsorName} / ${campaignData?.name}`}
      image={sponsorImage ? `${AMAZON_S3_BUCKET}/${sponsorImage}` : null}
      classes="page__campaign-details"
      handleGoBack={() => navigate(-1)}
    >
      {isLoading ? (
        <Loading />
      ) : (
        <CampaignDetailsBlock
          campaignId={campaignId}
          campaignData={campaignData}
          sponsorId={sponsorId}
          campaign={`${sponsorName} / ${campaignData?.name}`}
        />
      )}
    </Page>
  );
};
