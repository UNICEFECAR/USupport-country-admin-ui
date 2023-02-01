import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  Block,
  BaseTable,
  Button,
  Grid,
  GridItem,
  InputSearch,
} from "@USupport-components-library/src";

const AMAZON_S3_BUCKET = `${import.meta.env.VITE_AMAZON_S3_BUCKET}`;

import "./campaigns.scss";

/**
 * Campaigns
 *
 * Campaigns block
 *
 * @return {jsx}
 */
export const Campaigns = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("campaigns");
  const rows = [
    t("sponsor"),
    t("campaigns"),
    t("active_campaigns"),
    t("email"),
    t("phone"),
  ];

  const data = [
    {
      sponsor: "unicef 1",
      campaigns: 10,
      activeCampaigns: 2,
      email: "user@mail.com",
      phone: "089999999",
      sponsorId: "1",
    },
    {
      sponsor: "unicef 2",
      campaigns: 20,
      activeCampaigns: 4,
      email: "user1@mail.com",
      phone: "089999999",
      sponsorId: "2",
    },
    {
      sponsor: "unicef 3",
      campaigns: 5,
      activeCampaigns: 6,
      email: "user2@mail.com",
      phone: "089999999",
      sponsorId: "3",
    },
  ];

  const rowsData = data.map((item, index) => {
    return [
      <div key={"item" + index} className="campaigns__sponsor">
        <img
          className="campaigns__sponsor__image"
          src={AMAZON_S3_BUCKET + "/default"}
        />
        <p className="text campaigns__sponsor__name">{item.sponsor}</p>
      </div>,
      <p>{item.campaigns}</p>,
      <p>{item.activeCampaigns}</p>,
      <p>{item.email}</p>,
      <p>{item.phone}</p>,
    ];
  });

  const menuOptions = [
    {
      icon: "edit",
      text: t("edit"),
      handleClick: (id) => navigate(`/sponsor?sponsordId=${id}`),
    },
  ];

  return (
    <Block classes="campaigns">
      <div className="campaigns__buttons">
        <Button label={t("filter_button")} color="purple" type="secondary" />
        <Button label={t("add_button")} color="purple" />
      </div>

      <Grid classes="campaigns__information">
        <GridItem xs={4} md={2} lg={3}>
          <p>
            {t("sponsors")}: <strong>{"10"}</strong>
          </p>
        </GridItem>
        <GridItem xs={4} md={2} lg={3}>
          <p>
            {t("campaigns")}: <strong>{"2"}</strong>
          </p>
        </GridItem>
        <GridItem xs={4} md={2} lg={3}>
          <p>
            {t("active_campaigns")}: <strong>{"5"}</strong>
          </p>
        </GridItem>
        <GridItem xs={4} md={8} lg={3}>
          <InputSearch />
        </GridItem>
      </Grid>

      <BaseTable
        data={data}
        rows={rows}
        rowsData={rowsData}
        menuOptions={menuOptions}
        handleClickPropName={"sponsorId"}
      />
    </Block>
  );
};
