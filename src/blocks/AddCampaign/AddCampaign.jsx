import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import Joi from "joi";

import {
  Block,
  Button,
  ButtonWithIcon,
  Grid,
  GridItem,
  Input,
  Textarea,
  Toggle,
} from "@USupport-components-library/src";

import {
  pascalToSnakeCase,
  validate,
} from "@USupport-components-library/utils";

import { useGetCampaignDetails } from "#hooks";

import "./add-campaign.scss";
import { useEffect } from "react";

/**
 * AddCampaign
 *
 * Add campaign block
 *
 * @return {jsx}
 */
export const AddCampaign = ({ campaignId }) => {
  const currencySymbol = localStorage.getItem("currency_symbol");
  const { t } = useTranslation("add-campaign");

  const schema = Joi.object({
    campaignName: Joi.string().required().label(t("required_field")),
    code: Joi.string().required().label(t("required_field")),
    budget: Joi.number().required().label(t("budget_error")),
    totalCoupons: Joi.number().required().label(t("required_field")),
    startDate: Joi.string().required().label(t("required_field")),
    endDate: Joi.string().required().label(t("required_field")),
    maxCouponsPerUser: Joi.number().required().label(t("required_field")),
    termsAndConditions: Joi.string().required().label(t("required_field")),
    isActive: Joi.boolean().required().label(t("required_field")),
  });

  const campaignDataQuery = useGetCampaignDetails(campaignId);
  const campaignData = campaignDataQuery.data;

  const [data, setData] = useState({
    campaignName: campaignData ? campaignData.campaignName : "",
    code: campaignData ? campaignData.code : "",
    budget: campaignData ? campaignData.budget : "",
    totalCoupons: campaignData ? campaignData.totalCoupons : "",
    startDate: campaignData ? campaignData.startDate : "",
    endDate: campaignData ? campaignData.endDate : "",
    maxCouponsPerUser: campaignData ? campaignData.maxCouponsPerUser : "",
    termsAndConditions: campaignData ? campaignData.termsAndConditions : "",
    isActive: campaignData ? campaignData.isActive : false,
  });

  const [canSaveChanges, setCanSaveChanges] = useState(false);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (campaignData) {
      const oldData = JSON.stringify(campaignData);
      const data = JSON.stringify(data);

      setCanSaveChanges(oldData !== data);
    }
  }, [data]);

  const handleSubmit = async () => {
    if ((await validate(data, schema, setErrors)) === null) {
      console.log(data, "success");
    }
  };

  const handleSaveChanges = () => {};
  const handleCreate = () => {};
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
            if (key === "isActive")
              return (
                <div
                  key={index}
                  className="add-campaign__grid__toggle-container"
                >
                  <Toggle
                    isToggled={data.isActive}
                    shouldChangeState
                    setParentState={(toggled) =>
                      setData({ ...data, isActive: toggled })
                    }
                  />
                  <h4>{t("activate")}</h4>
                </div>
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
                onClick={handleSaveChanges}
                size="lg"
                classes="add-campaign__grid__create-button"
              />

              <Button
                label={t("discard_changes")}
                onClick={handleCreate}
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
