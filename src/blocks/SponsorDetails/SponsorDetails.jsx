import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  BaseTable,
  Block,
  Button,
  Grid,
  GridItem,
  InputSearch,
} from "@USupport-components-library/src";

import "./sponsor-details.scss";

/**
 * SponsorDetails
 *
 * Sponsor details block
 *
 * @return {jsx}
 */
export const SponsorDetails = ({ data }) => {
  const navigate = useNavigate();
  const { t } = useTranslation("sponsor-details");
  const currencySymbol = localStorage.getItem("currency_symbol");

  const rows = [
    t("campaign"),
    t("used_total_coupons"),
    t("coupon_price"),
    t("used_total_price"),
    t("max_coupons"),
    t("period"),
    t("status"),
  ];

  const rowsData = data.campaignsData.map((item) => {
    return [
      <p>{item.campaignName}</p>,
      <p>
        {item.usedCoupons}/{item.totalCoupons}
      </p>,
      <p>
        {item.price}
        {currencySymbol}
      </p>,
      <p>
        {item.price * item.usedCoupons}
        {currencySymbol}/{item.totalPrice}
        {currencySymbol}
      </p>,
      <p>{item.maxCouponsPerUser}</p>,
      <p>
        {item.startDate} - {item.endDate}
      </p>,
      <p>{item.status}</p>,
    ];
  });

  const menuOptions = [
    {
      icon: "edit",
      text: t("edit"),
      handleClick: (id) =>
        navigate(`/edit-campaign?campaignId=${id}`, {
          state: { sponsorName: data.sponsorName },
        }),
    },
  ];

  const handleAddCampaign = () =>
    navigate(`/add-campaign?sponsorId=${data.sponsorId}`, {
      state: { sponsorName: data.sponsorName },
    });

  return (
    <Block classes="sponsor-details">
      <div className="sponsor-details__buttons-container">
        <Button label={t("filter")} type="secondary" color="purple" size="md" />
        <Button
          label={t("add_campaign")}
          color="purple"
          size="md"
          onClick={handleAddCampaign}
        />
      </div>
      <Grid classes="sponsor-details__grid">
        <GridItem md={2} classes="sponsor-details__grid-item">
          <p>
            {t("campaigns")}: <strong>{data.campaigns}</strong>
          </p>
        </GridItem>

        <GridItem md={2} classes="sponsor-details__grid-item">
          <p>
            {t("active_campaigns")}: <strong>{data.activeCampaigns}</strong>
          </p>
        </GridItem>

        <GridItem md={2} classes="sponsor-details__grid-item">
          <p>
            {t("email")}: <strong>{data.email}</strong>
          </p>
        </GridItem>

        <GridItem md={2} classes="sponsor-details__grid-item">
          <p>
            {t("phone_number")}: <strong>{data.phoneNumber}</strong>
          </p>
        </GridItem>

        <GridItem md={8} classes="sponsor-details__grid-item">
          <InputSearch placeholder={t("search")} />
        </GridItem>
      </Grid>
      <BaseTable
        data={data.campaignsData}
        rows={rows}
        rowsData={rowsData}
        handleClickPropName="campaignId"
        menuOptions={menuOptions}
      />
    </Block>
  );
};
