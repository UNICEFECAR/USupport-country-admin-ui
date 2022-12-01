import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
  Block,
  Button,
  DropdownWithLabel,
  Error,
  Grid,
  GridItem,
  Input,
  Loading,
} from "@USupport-components-library/src";

import { validate, validateProperty } from "@USupport-components-library/utils";
import { useGetAdminData, useUpdateAdminData } from "#hooks";
import countryCodes from "country-codes-list";
import Joi from "joi";

import "./edit-profile-details.scss";

/**
 * EditProfileDetails
 *
 * Edit profile details block
 *
 * @return {jsx}
 */
export const EditProfileDetails = () => {
  const { t } = useTranslation("edit-profile-details");
  const [adminQuery, adminData, setAdminData] = useGetAdminData();

  const [isProcessing, setIsProcessing] = useState(false);
  const [canSaveChanges, setCanSaveChanges] = useState(false);

  const [errors, setErrors] = useState({});

  const [phonePrefixes, setPhonePrefixes] = useState();

  useEffect(() => {
    const codes = generateCountryCodes();
    if (adminData && !adminData?.phonePrefix) {
      const usersCountry = localStorage.getItem("country");

      const userCountryCode = codes.find(
        (x) => x.country === usersCountry
      )?.value;
      if (userCountryCode) {
        handleChange("phonePrefix", userCountryCode);
      } else {
        handleChange(
          "phonePrefix",
          codes.find((x) => x.country === "KZ")?.value
        );
      }
    }
    setPhonePrefixes(codes);
  }, [adminData]);

  useEffect(() => {
    if (adminData && adminQuery.data) {
      const adminDataStringified = JSON.stringify(adminData);
      const originalData = JSON.stringify(adminQuery.data);
      setCanSaveChanges(adminDataStringified !== originalData);
    }
  }, [adminData, adminQuery.data]);

  const schema = Joi.object({
    adminId: Joi.any(),
    name: Joi.string().label(t("name_error")),
    surname: Joi.string().label(t("surname_error")),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .label(t("email_error")),
    phonePrefix: Joi.string().label(t("phone_prefix_error")),
    phone: Joi.string().label(t("phone_error")),
    role: Joi.any(),
  });

  const handleChange = (field, value) => {
    const data = { ...adminData };
    data[field] = value;
    setAdminData(data);
  };

  const handleBlur = (field) => {
    validateProperty(field, adminData[field], schema, setErrors);
  };

  const onUpdateSuccess = () => {
    setIsProcessing(false);
    toast(t("edit_success"));
  };
  const onUpdateError = (err) => {
    setErrors({ submit: err });
    setIsProcessing(false);
  };
  const updateAdminMutation = useUpdateAdminData(
    onUpdateSuccess,
    onUpdateError
  );

  const handleSave = async () => {
    setIsProcessing(true);
    if ((await validate(adminData, schema, setErrors)) === null) {
      updateAdminMutation.mutate(adminData);
    } else {
      setIsProcessing(false);
    }
  };

  const isLoading = adminQuery.isLoading || !adminData;

  const handleDiscard = () => {
    setAdminData(adminQuery.data);
  };

  return (
    <Block classes="edit-profile-details">
      {isLoading ? (
        <Loading size="lg" />
      ) : (
        <Grid classes="edit-profile-details__grid">
          <GridItem md={8} lg={12}>
            <Input
              value={adminData.name}
              onChange={(e) => handleChange("name", e.currentTarget.value)}
              errorMessage={errors.name}
              label={t("name_label")}
              placeholder={t("name_placeholder")}
            />
            <Input
              value={adminData.surname}
              onChange={(e) => handleChange("surname", e.currentTarget.value)}
              errorMessage={errors.surname}
              label={t("surname_label")}
              placeholder={t("surname_placeholder")}
            />
            <div className="edit-profile-details__grid__phone-container">
              {phonePrefixes && (
                <DropdownWithLabel
                  options={phonePrefixes}
                  label={t("phone_label")}
                  selected={adminData.phonePrefix}
                  setSelected={(value) => handleChange("phonePrefix", value)}
                  placeholder={t("phone_prefix_placeholder")}
                />
              )}
              <Input
                value={adminData.phone}
                onChange={(e) => handleChange("phone", e.currentTarget.value)}
                placeholder={t("phone_placeholder")}
                onBlur={() => handleBlur("phone")}
                classes="edit-profile-details__grid__phone-container__phone-input"
              />
            </div>
            {errors.phone || errors.phonePrefix ? (
              <Error
                classes="edit-profile-details__grid__phone-error"
                message={errors.phone || errors.phonePrefix}
              />
            ) : null}
            <Input
              value={adminData.email}
              onChange={(e) => handleChange("email", e.currentTarget.value)}
              errorMessage={errors.email}
              label={t("email_label")}
              placeholder={t("email_placeholder")}
              onBlur={() => handleBlur("email")}
            />
            {errors.submit ? <Error message={errors.submit} /> : null}
            <Button
              classes="edit-profile-details__grid__save-button"
              type="primary"
              label={t("button_text")}
              size="lg"
              onClick={handleSave}
              disabled={!canSaveChanges || isProcessing}
            />
            <Button
              type="secondary"
              classes="edit-profile-details__grid__discard-button"
              label={t("button_secondary_text")}
              size="lg"
              disabled={!canSaveChanges}
              onClick={handleDiscard}
            />
          </GridItem>
        </Grid>
      )}
    </Block>
  );
};

function generateCountryCodes() {
  const countryCodesList = countryCodes.customList(
    "countryCode",
    "+{countryCallingCode}"
  );
  const codes = [];
  Object.keys(countryCodesList).forEach((key) => {
    codes.push({
      value: countryCodesList[key],
      label: `${key}: ${countryCodesList[key]}`,
      country: key,
    });
  });
  codes.sort((a, b) => {
    return a.country > b.country ? 1 : -1;
  });
  return codes;
}
