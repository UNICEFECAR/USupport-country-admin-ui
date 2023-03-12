import React, { useCallback, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";

import {
  Block,
  Grid,
  GridItem,
  Button,
  BaseTable,
  Toggle,
  Loading,
} from "@USupport-components-library/src";

import {
  pascalToSnakeCase,
  getDateView,
} from "@USupport-components-library/utils";

import { useGetCouponsData, useUpdateCampaignData } from "#hooks";

import "./campaign-details.scss";
import { toast } from "react-toastify";

/**
 * CampaignDetails
 *
 * Campaign details block
 *
 * @return {jsx}
 */
export const CampaignDetails = ({ data, campaignId, sponsorId }) => {
  const { t } = useTranslation("campaign-details");
  const queryClient = useQueryClient();

  const currencySymbol = localStorage.getItem("currency_symbol");

  const fieldsToDisplay = [
    "couponCode",
    "usedCoupons",
    "numberOfCoupons",
    "couponPrice",
    "usedBudget",
    "budget",
    "maxCouponsPerClient",
    "startDate",
    "endDate",
  ];

  const { data: couponsData, isLoading } = useGetCouponsData(campaignId);

  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (data) {
      setIsActive(data.active);
    }
  }, [data]);

  const tableRows = ["№", t("provider"), t("used_on")];

  const getTableRowsData = useCallback(() => {
    return couponsData?.map((coupon, index) => {
      return [
        <p>{index + 1}</p>,
        <p>{coupon.providerName}</p>,
        <p>{getDateView(coupon.createdAt)}</p>,
      ];
    });
  }, [couponsData]);

  const onSuccess = (data) => {
    toast(t(data.active ? "campaign_activated" : "campaign_deactivated"));
    queryClient.invalidateQueries({ queryKey: ["sponsor-data", sponsorId] });
    queryClient.invalidateQueries({ queryKey: ["campaign-data", campaignId] });
  };
  const onError = () => {
    toast(t("update_error"), { type: "error" });
    setIsActive(data.active);
  };
  const updateCampaignMutation = useUpdateCampaignData(onSuccess, onError);

  const handleChangeCampaignStatus = () => {
    setIsActive(!isActive);
    updateCampaignMutation.mutate({
      ...data,
      active: !isActive,
    });
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

        <>
          <GridItem md={8} lg={12}>
            <div className="campaign-details__grid__activate-campaign">
              <Toggle
                isToggled={isActive}
                setParentState={(toggled) =>
                  handleChangeCampaignStatus(toggled)
                }
              />
              <p>{t(isActive ? "deactivate_campaign" : "activate_campaign")}</p>
            </div>
          </GridItem>
          {fieldsToDisplay.map((field, index) => {
            const fieldLabel = t(pascalToSnakeCase(field));
            const showCurrencySymbol = [
              "usedBudget",
              "budget",
              "couponPrice",
            ].includes(field);
            return (
              <GridItem md={2} lg={3} key={index}>
                <p>
                  {fieldLabel}:{" "}
                  <strong>
                    {field.includes("Date")
                      ? getDateView(data[field])
                      : data[field]}
                    {showCurrencySymbol ? currencySymbol : ""}
                  </strong>
                </p>
              </GridItem>
            );
          })}
        </>
      </Grid>
      {isLoading ? (
        <Loading />
      ) : (
        <BaseTable rows={tableRows} rowsData={getTableRowsData()} />
      )}
    </Block>
  );
};
