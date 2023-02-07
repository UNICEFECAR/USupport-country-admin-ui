import React from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { Loading } from "@USupport-components-library/src";

import { Page, SponsorDetails as SponsorDetailsBlock } from "#blocks";

import { useGetSponsorData } from "#hooks";

const AMAZON_S3_BUCKET = `${import.meta.env.VITE_AMAZON_S3_BUCKET}`;

import "./sponsor-details.scss";

/**
 * SponsorDetails
 *
 * Display sponsor's campaigns and details
 *
 * @returns {JSX.Element}
 */
export const SponsorDetails = () => {
  const navigate = useNavigate();
  const sponsorId = new URLSearchParams(window.location.search).get(
    "sponsorId"
  );

  if (!sponsorId) return <Navigate to="/campaigns" />;

  const { data: sponsorData, isLoading } = useGetSponsorData(sponsorId);

  return (
    <Page
      handleGoBack={() => navigate(-1)}
      heading={sponsorData?.sponsorName}
      image={
        sponsorData?.image
          ? `${AMAZON_S3_BUCKET}/${sponsorData.image || "default"}`
          : null
      }
      classes="page__sponsor-details"
    >
      {isLoading ? <Loading /> : <SponsorDetailsBlock data={sponsorData} />}
    </Page>
  );
};
