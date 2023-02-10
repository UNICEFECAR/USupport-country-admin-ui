import React, { useState } from "react";
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

import { getDateView } from "@USupport-components-library/utils";

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

  const [searchValue, setSearchValue] = useState("");

  const rows = [
    t("campaign"),
    t("used_total_coupons"),
    t("coupon_price"),
    t("used_total_budget"),
    t("max_coupons"),
    t("period"),
    t("status"),
  ];

  const rowsData = data.campaignsData
    ?.filter((x) => x.name.toLowerCase().includes(searchValue.toLowerCase()))
    .map((item) => {
      return [
        <p>{item.name}</p>,
        <p>
          {item.couponData.length}/{item.numberOfCoupons}
        </p>,
        <p>
          {item.couponPrice}
          {currencySymbol}
        </p>,
        <p>
          {item.couponPrice * item.couponData.length}
          {currencySymbol}/{item.budget}
          {currencySymbol}
        </p>,
        <p>{item.maxCouponsPerClient}</p>,
        <p>
          {getDateView(item.startDate)} - {getDateView(item.endDate)}
        </p>,
        <p>{t(item.active ? "active" : "inactive")}</p>,
      ];
    });

  const handleNavigate = (id, route) => {
    const campaignData = data.campaignsData?.find((x) => x.campaignId === id);
    console.log(campaignData);
    navigate(`/${route}?campaignId=${id}`, {
      state: {
        sponsorName: data.sponsorName,
        sponsorImage: data.image,
        campaignData,
      },
    });
  };
  const menuOptions = [
    {
      icon: "view",
      text: t("view"),
      handleClick: (id) => handleNavigate(id, "campaign-details"),
    },
    {
      icon: "edit",
      text: t("edit"),
      handleClick: (id) => handleNavigate(id, "edit-campaign"),
    },
  ];

  const handleAddCampaign = () =>
    navigate(`/add-campaign?sponsorId=${data.sponsorId}`, {
      state: { sponsorName: data.sponsorName, sponsorImage: data.image },
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
            {t("phone_number")}:{" "}
            <strong>
              {data.phonePrefix} {data.phone}
            </strong>
          </p>
        </GridItem>

        <GridItem md={8} classes="sponsor-details__grid-item">
          <InputSearch
            placeholder={t("search")}
            value={searchValue}
            onChange={setSearchValue}
          />
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
