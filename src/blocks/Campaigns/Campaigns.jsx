import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  Block,
  BaseTable,
  Button,
  Grid,
  GridItem,
  InputSearch,
  Loading,
} from "@USupport-components-library/src";

import { useGetAllSponsorsData } from "#hooks";

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

  const [searchValue, setSearchValue] = useState("");

  const { data, isLoading } = useGetAllSponsorsData();

  const rowsData = data
    ?.filter((x) =>
      x.sponsorName.toLowerCase().includes(searchValue.toLowerCase())
    )
    .map((item, index) => {
      console.log(item);
      return [
        <div key={"item" + index} className="campaigns__sponsor">
          <img
            className="campaigns__sponsor__image"
            src={AMAZON_S3_BUCKET + (`/${item.image}` || "default")}
          />
          <p className="text campaigns__sponsor__name">{item.sponsorName}</p>
        </div>,
        <p>{item.totalCampaigns}</p>,
        <p>{item.activeCampaigns}</p>,
        <p>{item.email}</p>,
        <p>
          {item.phonePrefix} {item.phone}
        </p>,
      ];
    });

  const menuOptions = [
    {
      icon: "view",
      text: t("view"),
      handleClick: (id) => navigate(`/sponsor-details?sponsorId=${id}`),
    },
    {
      icon: "edit",
      text: t("edit"),
      handleClick: (id) => navigate(`/edit-sponsor?sponsorId=${id}`),
    },
  ];

  return (
    <Block classes="campaigns">
      <div className="campaigns__buttons">
        <Button label={t("filter_button")} color="purple" type="secondary" />
        <Button
          label={t("add_button")}
          color="purple"
          onClick={() => navigate("/add-sponsor")}
        />
      </div>

      <Grid classes="campaigns__information">
        <GridItem xs={4} md={2} lg={3}>
          <p>
            {t("sponsors")}: <strong>{data?.length}</strong>
          </p>
        </GridItem>
        <GridItem xs={4} md={2} lg={3}>
          <p>
            {t("campaigns")}:{" "}
            <strong>
              {data
                ?.filter(
                  (x) => Number(x.totalCampaigns) && Number(x.activeCampaigns)
                )
                .reduce(
                  (a, b) => Number(a.totalCampaigns) + Number(b.totalCampaigns)
                )}
            </strong>
          </p>
        </GridItem>
        <GridItem xs={4} md={2} lg={3}>
          <p>
            {t("active_campaigns")}:{" "}
            <strong>
              {data
                ?.filter(
                  (x) => Number(x.totalCampaigns) && Number(x.activeCampaigns)
                )
                .reduce(
                  (a, b) =>
                    Number(a.activeCampaigns) + Number(b.activeCampaigns)
                )}
            </strong>
          </p>
        </GridItem>
        <GridItem xs={4} md={8} lg={3}>
          <InputSearch
            placeholder={t("search")}
            value={searchValue}
            onChange={setSearchValue}
          />
        </GridItem>
      </Grid>

      {isLoading ? (
        <Loading />
      ) : (
        <BaseTable
          data={data}
          rows={rows}
          rowsData={rowsData}
          menuOptions={menuOptions}
          handleClickPropName={"sponsorId"}
        />
      )}
    </Block>
  );
};
