import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
  Block,
  Button,
  InputPhone,
  Error,
  Grid,
  GridItem,
  Input,
  Loading,
} from "@USupport-components-library/src";

import { validate, validateProperty } from "@USupport-components-library/utils";
import { useGetAdminData, useUpdateAdminData } from "#hooks";
import Joi from "joi";

import "./edit-profile-details.scss";

/**
 * EditProfileDetails
 *
 * Edit profile details block
 *
 * @return {jsx}
 */
export const EditProfileDetails = ({ openChangePassword }) => {
  const { t } = useTranslation("blocks", { keyPrefix: "edit-profile-details" });
  const [adminQuery, adminData, setAdminData] = useGetAdminData();

  const [canSaveChanges, setCanSaveChanges] = useState(false);

  const [errors, setErrors] = useState({});

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
    phone: Joi.string().optional().allow(null, "", " ").label(t("phone_error")),
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
    toast(t("edit_success"));
  };
  const onUpdateError = (err) => {
    setErrors({ submit: err });
  };
  const updateAdminMutation = useUpdateAdminData(
    onUpdateSuccess,
    onUpdateError
  );

  const handleSave = async () => {
    if ((await validate(adminData, schema, setErrors)) === null) {
      updateAdminMutation.mutate(adminData);
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
              label={t("name_label") + " *"}
              placeholder={t("name_placeholder")}
            />
            <Input
              value={adminData.surname}
              onChange={(e) => handleChange("surname", e.currentTarget.value)}
              errorMessage={errors.surname}
              label={t("surname_label") + " *"}
              placeholder={t("surname_placeholder")}
            />
            <InputPhone
              label={t("phone_label")}
              errorMessage={errors.phone}
              onBlur={() => handleBlur("phone")}
              value={adminData.phone}
              onChange={(value) => handleChange("phone", value)}
              placeholder={t("phone_placeholder")}
              classes="edit-profile-details__grid__phone-input"
            />
            <Input
              value={adminData.email}
              onChange={(e) => handleChange("email", e.currentTarget.value)}
              errorMessage={errors.email}
              label={t("email_label") + " *"}
              placeholder={t("email_placeholder")}
              onBlur={() => handleBlur("email")}
            />
            {errors.submit ? <Error message={errors.submit} /> : null}
            <div className="edit-profile-details__grid__buttons-container">
              <Button
                type="primary"
                label={t("button_text")}
                size="lg"
                onClick={handleSave}
                disabled={!canSaveChanges}
                loading={updateAdminMutation.isLoading}
              />
              <Button
                type="primary"
                label={t("button_change_password")}
                size="lg"
                onClick={openChangePassword}
              />
              <Button
                type="secondary"
                label={t("button_secondary_text")}
                size="lg"
                disabled={!canSaveChanges}
                onClick={handleDiscard}
              />
            </div>
          </GridItem>
        </Grid>
      )}
    </Block>
  );
};
