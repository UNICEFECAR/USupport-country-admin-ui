import React from "react";
import { useTranslation } from "react-i18next";

import {
  Block,
  Grid,
  GridItem,
  Button,
  BaseTable,
  Toggle,
  Loading,
} from "@USupport-components-library/src";

import { pascalToSnakeCase } from "@USupport-components-library/utils";

import { useGetCampaignDetails } from "#hooks";

import "./campaign-details.scss";

/**
 * CampaignDetails
 *
 * Campaign details block
 *
 * @return {jsx}
 */
export const CampaignDetails = ({ campaignId }) => {
  const { t } = useTranslation("campaign-details");

  const currencySymbol = localStorage.getItem("currency_symbol");

  const campaignDetailsQuery = useGetCampaignDetails(campaignId);
  const data = campaignDetailsQuery.data;

  const fieldsToDisplay = [
    "code",
    "usedCoupons",
    "totalCoupons",
    "pricePerCoupon",
    "usedBudget",
    "budget",
    "maxCouponsPerUser",
    "startDate",
    "endDate",
  ];

  const tableRows = ["№", t("provider"), t("used_on")];

  const tableRowsData = data?.usedCouponsData.map((coupon, index) => {
    return [
      <p>{coupon.id}</p>,
      <p>{coupon.providerData.providerName}</p>,
      <p>{coupon.usedOn}</p>,
    ];
  });

  const handleChangeCampaignStatus = (status) => {
    console.log(status === true ? "active" : "inactive");
  };

  const handleExportReport = () => {};

  return (
    <Block classes="campaign-details">
      <Grid classes="campaign-details__grid">
        <GridItem md={8} lg={12}>
          <div className="campaign-details__buttons-container">
            <Button
              label={t("filter")}
              type="secondary"
              color="purple"
              size="md"
            />
            <Button
              label={t("export_report")}
              color="purple"
              size="md"
              onClick={handleExportReport}
            />
          </div>
        </GridItem>
        {campaignDetailsQuery.isLoading ? (
          <GridItem md={8} lg={12}>
            <Loading />
          </GridItem>
        ) : (
          <>
            <GridItem md={8} lg={12}>
              <div className="campaign-details__grid__activate-campaign">
                <Toggle
                  isToggled={data.status === "active"}
                  setParentState={(toggled) =>
                    handleChangeCampaignStatus(toggled)
                  }
                />
                <p>
                  {t(
                    data.isActive ? "deactivate_campaign" : "activate_campaign"
                  )}
                </p>
              </div>
            </GridItem>
            {fieldsToDisplay.map((field, index) => {
              const fieldLabel = t(pascalToSnakeCase(field));
              const showCurrencySymbol = [
                "usedBudget",
                "budget",
                "pricePerCoupon",
              ].includes(field);
              return (
                <GridItem md={2} key={index}>
                  <p>
                    {fieldLabel}:{" "}
                    <strong>
                      {data[field]}
                      {showCurrencySymbol ? currencySymbol : ""}
                    </strong>
                  </p>
                </GridItem>
              );
            })}
          </>
        )}
      </Grid>
      <BaseTable rows={tableRows} rowsData={tableRowsData} />
    </Block>
  );
};
