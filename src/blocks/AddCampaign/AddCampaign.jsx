import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import Joi from "joi";

import {
  Block,
  Button,
  ButtonWithIcon,
  DateInput,
  Error,
  Grid,
  GridItem,
  Input,
  Textarea,
  Toggle,
} from "@USupport-components-library/src";

import {
  pascalToSnakeCase,
  validate,
  getDateDashes,
} from "@USupport-components-library/utils";

import { useCreateCampaignForSponsor, useUpdateCampaignData } from "#hooks";

import { transformCampaignData } from "#utils";

import "./add-campaign.scss";

/**
 * AddCampaign
 *
 * Add campaign block
 *
 * @return {jsx}
 */
export const AddCampaign = ({
  sponsorName,
  sponsorId,
  sponsorImage,
  campaignData,
  campaignId,
  isEdit,
}) => {
  const navigate = useNavigate();
  const currencySymbol = localStorage.getItem("currency_symbol");
  const { t } = useTranslation("add-campaign");

  const schema = Joi.object({
    name: Joi.string().required().label(t("required_field")),
    couponCode: Joi.string().required().label(t("required_field")),
    budget: Joi.number().required().label(t("budget_error")),
    numberOfCoupons: Joi.number().required().label(t("required_field")),
    startDate: Joi.string().required().label(t("required_field")),
    endDate: Joi.string().required().label(t("required_field")),
    maxCouponsPerClient: Joi.number().required().label(t("required_field")),
    termsAndConditions: Joi.string().required().label(t("required_field")),
    active: Joi.boolean().required().label(t("required_field")),
  });

  const [data, setData] = useState({
    name: campaignData ? campaignData.name : "",
    couponCode: campaignData ? campaignData.couponCode : "",
    budget: campaignData ? campaignData.budget : "",
    numberOfCoupons: campaignData ? campaignData.numberOfCoupons : "",
    maxCouponsPerClient: campaignData ? campaignData.maxCouponsPerClient : "",
    startDate: campaignData ? getDateDashes(campaignData.startDate) : "",
    endDate: campaignData ? getDateDashes(campaignData.endDate) : "",
    termsAndConditions: campaignData ? campaignData.termsAndConditions : "",
    active: campaignData ? campaignData.active : false,
  });

  const oldData = {
    name: campaignData?.name,
    couponCode: campaignData?.couponCode,
    budget: campaignData?.budget,
    numberOfCoupons: campaignData?.numberOfCoupons,
    maxCouponsPerClient: campaignData?.maxCouponsPerClient,
    startDate: getDateDashes(campaignData?.startDate),
    endDate: getDateDashes(campaignData?.endDate),
    termsAndConditions: campaignData?.termsAndConditions,
    active: campaignData?.active,
  };

  const [canSaveChanges, setCanSaveChanges] = useState(false);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (campaignData && oldData) {
      const dataStr = JSON.stringify(data);

      setCanSaveChanges(JSON.stringify(oldData) !== dataStr);
    }
  }, [data, oldData]);

  const queryClient = useQueryClient();
  const onCreateSuccess = (campaign) => {
    queryClient.invalidateQueries({ queryKey: ["sponsor-data", sponsorId] });
    const campaignData = transformCampaignData(campaign);
    if (isEdit) {
      navigate(-1);
    } else {
      navigate(
        `/campaign-details?sponsorId=${sponsorId}&campaignId=${campaign.campaign_id}`,
        {
          state: {
            sponsorName,
            campaignData,
            sponsorImage,
          },
        }
      );
    }
  };
  const onCreateError = (err) => {
    setErrors({ submit: err });
  };
  const createCampaignMutation = useCreateCampaignForSponsor(
    onCreateSuccess,
    onCreateError
  );

  const checkIsPeriodValid = () => {
    const today = new Date().getTime();
    const campaignStartDate = new Date(data.startDate).getTime();
    const campaignEndDate = new Date(data.endDate).getTime();

    if (today > campaignStartDate) {
      setErrors({
        submit: t("start_date_error"),
      });
      return false;
    }

    if (today > campaignEndDate) {
      setErrors({
        submit: t("end_date_error"),
      });
      return false;
    }

    if (campaignEndDate < campaignStartDate) {
      setErrors({
        submit: t("period_error"),
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setErrors({});
    const isValid = checkIsPeriodValid();

    if (!isValid) return;

    if ((await validate(data, schema, setErrors)) === null) {
      createCampaignMutation.mutate({
        sponsorId,
        ...data,
      });
    }
  };
  const updateCampaignMutation = useUpdateCampaignData(
    onCreateSuccess,
    onCreateError
  );
  const handleSaveChanges = async () => {
    setErrors({});

    if (oldData.startDate !== data.startDate) {
      const isValid = checkIsPeriodValid();

      if (!isValid) return;
    }
    if ((await validate(data, schema, setErrors)) === null) {
      updateCampaignMutation.mutate({
        campaignId,
        ...data,
      });
    } else {
      console.log(errors);
    }
  };
  const handleDiscardChanges = () => {
    setData(oldData);
  };

  return (
    <Block classes="add-campaign">
      <Grid classes="add-campaign__grid">
        <GridItem md={8} lg={12}>
          {Object.keys(data).map((key, index) => {
            const keyName = pascalToSnakeCase(key);

            const singleCouponPrice = data.budget / data.numberOfCoupons;
            const showSingleCouponPrice =
              keyName === "number_of_coupons" &&
              !isNaN(data.budget) &&
              !isNaN(data.numberOfCoupons) &&
              !isNaN(singleCouponPrice) &&
              singleCouponPrice !== Infinity;

            if (key === "termsAndConditions")
              return (
                <Textarea
                  key={index}
                  label={t(`terms_label`) + " *"}
                  placeholder={t("terms_placeholder")}
                  value={data[key]}
                  errorMessage={errors[key]}
                  onChange={(value) => {
                    setData({ ...data, [key]: value });
                  }}
                />
              );
            if (key === "active")
              return (
                <div
                  key={index}
                  className="add-campaign__grid__toggle-container"
                >
                  <Toggle
                    isToggled={data.active}
                    shouldChangeState
                    setParentState={(toggled) =>
                      setData({ ...data, active: toggled })
                    }
                  />
                  <h4>{t("activate")}</h4>
                </div>
              );
            if (key.includes("Date"))
              return (
                <DateInput
                  key={index}
                  label={t(`${keyName}_label`) + " *"}
                  placeholder={t("dates_placeholder")}
                  value={data[key]}
                  errorMessage={errors[key]}
                  onChange={(e) => {
                    let value = e.currentTarget.value;
                    setData({ ...data, [key]: value });
                  }}
                />
              );
            return (
              <>
                <Input
                  key={index}
                  label={
                    t(
                      `${keyName}_label`,
                      keyName === "budget" && { currencySymbol }
                    ) + " *"
                  }
                  placeholder={t(`${keyName}_placeholder`)}
                  value={data[key]}
                  errorMessage={errors[key]}
                  classes={
                    showSingleCouponPrice &&
                    "add-campaign__grid__number-of-coupons__input"
                  }
                  onChange={(e) => {
                    let value = e.currentTarget.value;
                    setData({ ...data, [key]: value });
                  }}
                />
                {showSingleCouponPrice && (
                  <p className="add-campaign__grid__number-of-coupons__info small-text">
                    {t("budget_info")} {singleCouponPrice.toFixed(2)}
                    {currencySymbol}
                  </p>
                )}
              </>
            );
          })}
          {errors.submit && <Error message={errors.submit} />}
          {!campaignData ? (
            <Button
              onClick={handleSubmit}
              label={t("create_campaign")}
              size="lg"
            />
          ) : (
            <>
              <Button
                label={t("save_changes")}
                disabled={!canSaveChanges}
                loading={updateCampaignMutation.isLoading}
                onClick={handleSaveChanges}
                size="lg"
                classes="add-campaign__grid__create-button"
              />

              <Button
                label={t("discard_changes")}
                onClick={handleDiscardChanges}
                disabled={!canSaveChanges}
                size="lg"
                classes="add-campaign__grid__create-button"
                type="secondary"
                color="green"
              />
            </>
          )}
        </GridItem>
      </Grid>
    </Block>
  );
};
