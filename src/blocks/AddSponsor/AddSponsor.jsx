import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import countryCodes from "country-codes-list";
import Joi from "joi";

import {
  Block,
  Button,
  ButtonWithIcon,
  Error,
  Grid,
  GridItem,
  ProfilePicturePreview,
  Input,
  DropdownWithLabel,
} from "@USupport-components-library/src";

import { validate } from "@USupport-components-library/utils";

import { useGetSponsorData } from "#hooks";

import "./add-sponsor.scss";

/**
 * AddSponsor
 *
 * Add sponsor block
 *
 * @return {jsx}
 */
export const AddSponsor = ({ sponsorId }) => {
  const { t } = useTranslation("add-sponsor");

  const sponsorDataQuery = useGetSponsorData(sponsorId);
  const sponsorData = sponsorDataQuery.data || {
    sponsor: "Sponsor",
    email: "georgi@7digit.io",
    phonePrefix: "+7",
    phone: "89342792",
  };

  const schema = Joi.object({
    sponsor: Joi.string().required().label(t("sponsor_error")),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .label(t("email_error")),
    phonePrefix: Joi.string().label(t("phone_prefix_error")),
    phone: Joi.string().label(t("phone_error")),
  });

  const [data, setData] = useState({
    sponsor: sponsorData ? sponsorData.sponsor : "",
    email: sponsorData ? sponsorData.email : "",
    phonePrefix: sponsorData ? sponsorData.phonePrefix : "",
    phone: sponsorData ? sponsorData.phone : "",
    image: sponsorData ? sponsorData.image : "default",
  });

  const [errors, setErrors] = useState("");

  const [phonePrefixes, setPhonePrefixes] = useState();

  const [canSaveChanges, setCanSaveChanges] = useState(false);

  useEffect(() => {
    // Country codes logic
    const codes = generateCountryCodes();
    if (data && !data?.phonePrefix) {
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

    // Compare current data with data coming from DB to check if the changes can be saved
    const oldData = JSON.stringify({
      sponsor: sponsorData?.sponsor,
      email: sponsorData?.email,
      phonePrefix: sponsorData?.phonePrefix,
      phone: sponsorData?.phone,
    });
    const currentData = JSON.stringify(data);

    setCanSaveChanges(oldData !== currentData);
  }, [data]);

  const handleChange = (name, value) => {
    setData({ ...data, [name]: value });
  };

  const handleCreate = async () => {
    if ((await validate(data, schema, setErrors)) === null) {
      console.log("create");
    }
  };

  const handleSaveChanges = async () => {};

  const openDeleteAccountBackdrop = () => {};

  return (
    <Block classes="add-sponsor">
      <Grid classes="add-sponsor__grid">
        <GridItem md={8} lg={12}>
          <ProfilePicturePreview
            image="default"
            changePhotoText={t("select_photo")}
          />
          <Input
            value={data.sponsor}
            onChange={(e) => handleChange("sponsor", e.currentTarget.value)}
            errorMessage={errors.sponsor}
            label={t("sponsor_label")}
            placeholder={t("sponsor_placeholder")}
          />
          <Input
            value={data.email}
            onChange={(e) => handleChange("email", e.currentTarget.value)}
            errorMessage={errors.email}
            label={t("email_label")}
            placeholder={t("email_placeholder")}
          />
          <div className="add-sponsor__grid__phone-container">
            {phonePrefixes && (
              <DropdownWithLabel
                options={phonePrefixes}
                label={t("phone_label")}
                selected={
                  data.phonePrefix ||
                  phonePrefixes.find((x) => x.country === usersCountry)?.value
                }
                setSelected={(value) => handleChange("phonePrefix", value)}
                placeholder={t("phone_prefix_placeholder")}
              />
            )}
            <Input
              value={data.phone}
              onChange={(e) => handleChange("phone", e.currentTarget.value)}
              placeholder={t("phone_placeholder")}
              classes="add-sponsor__grid__phone-container__phone-input"
            />
          </div>
          {errors.phone || errors.phonePrefix ? (
            <Error
              classes="add-sponsor__grid__phone-error"
              message={errors.phone || errors.phonePrefix}
            />
          ) : null}
          {!sponsorData ? (
            <Button
              label={t("create_sponsor")}
              onClick={handleCreate}
              size="lg"
              classes="add-sponsor__grid__create-button"
            />
          ) : (
            <>
              <Button
                label={t("save_changes")}
                disabled={!canSaveChanges}
                onClick={handleSaveChanges}
                size="lg"
                classes="add-sponsor__grid__create-button"
              />

              <Button
                label={t("discard_changes")}
                onClick={handleCreate}
                size="lg"
                classes="add-sponsor__grid__create-button"
                type="secondary"
                color="green"
              />
              <ButtonWithIcon
                iconName={"circle-close"}
                iconSize={"md"}
                size="lg"
                iconColor={"#eb5757"}
                color={"red"}
                label={t("delete_sponsor")}
                type={"ghost"}
                onClick={openDeleteAccountBackdrop}
              />
            </>
          )}
        </GridItem>
      </Grid>
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

  return codes;
}
