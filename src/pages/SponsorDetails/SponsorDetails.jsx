import React from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { Page, SponsorDetails as SponsorDetailsBlock } from "#blocks";

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

  const sponsorData = {
    sponsorId: "1",
    sponsorName: "Unicef",
    email: "mail@user.com",
    campaigns: 10,
    activeCampaigns: 2,
    phoneNumber: "0893948223",
    campaignsData: [
      {
        campaignName: "Unicef1",
        usedCoupons: 5,
        totalCoupons: 10,
        totalPrice: 500,
        maxCouponsPerUser: 5,
        startDate: "2020-02-01",
        endDate: "2020-02-20",
        status: "active",
        campaignId: "790",
        price: 50,
      },
      {
        campaignName: "Unicef2",
        usedCoupons: 5,
        totalCoupons: 10,
        totalPrice: 500,
        maxCouponsPerUser: 5,
        startDate: "2020-01-01",
        endDate: "2020-01-10",
        status: "inactive",
        campaignId: "791",
        price: 50,
      },
    ],
  };

  return (
    <Page
      handleGoBack={() => navigate(-1)}
      heading={sponsorData.sponsorName}
      classes="page__sponsor-details"
    >
      <SponsorDetailsBlock data={sponsorData} />
    </Page>
  );
};
