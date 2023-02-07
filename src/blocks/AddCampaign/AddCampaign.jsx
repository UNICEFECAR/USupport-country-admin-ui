import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

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

  const onCreateSuccess = (campaign) => {
    const campaignData = transformCampaignData(campaign);
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
  };
  const onCreateError = (err) => {
    setErrors({ submit: err });
  };
  const createCampaignMutation = useCreateCampaignForSponsor(
    onCreateSuccess,
    onCreateError
  );
  const handleSubmit = async () => {
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
  const deleteCampaign = () => {};

  return (
    <Block classes="add-campaign">
      <Grid classes="add-campaign__grid">
        <GridItem md={8} lg={12}>
          {Object.keys(data).map((key, index) => {
            const keyName = pascalToSnakeCase(key);
            if (key === "termsAndConditions")
              return (
                <Textarea
                  key={index}
                  label={t(`terms_label`)}
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
                  label={t(`${keyName}_label`)}
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
              <Input
                key={index}
                label={t(
                  `${keyName}_label`,
                  keyName === "budget" && { currencySymbol }
                )}
                placeholder={t(`${keyName}_placeholder`)}
                value={data[key]}
                errorMessage={errors[key]}
                onChange={(e) => {
                  let value = e.currentTarget.value;
                  setData({ ...data, [key]: value });
                }}
              />
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
                disabled={!canSaveChanges || updateCampaignMutation.isLoading}
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
              <ButtonWithIcon
                iconName={"circle-close"}
                iconSize={"md"}
                size="lg"
                iconColor={"#eb5757"}
                color={"red"}
                label={t("delete_campaign")}
                type={"ghost"}
                onClick={deleteCampaign}
              />
            </>
          )}
        </GridItem>
      </Grid>
    </Block>
  );
};
