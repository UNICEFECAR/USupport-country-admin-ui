import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";

import {
  Block,
  Button,
  DropdownGroup,
  DropdownWithLabel,
  Error,
  Grid,
  GridItem,
  Input,
  InputGroup,
  InputPassword,
  ProfilePicturePreview,
  Textarea,
} from "@USupport-components-library/src";

import { validate, validateProperty } from "@USupport-components-library/utils";
import { userSvc, providerSvc } from "@USupport-components-library/services";
import {
  useGetCountryAndLanguages,
  useGetWorkWithCategories,
  useCreateProvider,
} from "#hooks";
import countryCodes from "country-codes-list";
import Joi from "joi";

import "./create-provider.scss";
import { useNavigate } from "react-router-dom";

const initialData = {
  name: "",
  patronym: "",
  surname: "",
  nickname: "",
  email: "",
  phonePrefix: "",
  phone: "",
  image: "default",
  specializations: [],
  street: "",
  city: "",
  postcode: "",
  education: [],
  sex: "",
  consultationPrice: 0,
  description: "",
  languages: [],
  workWith: [],
  videoLink: "",
};

/**s
 * CreateProvider
 *
 * Create provider profile
 *
 * @return {jsx}
 */
export const CreateProvider = ({
  openDeletePictureBackdrop,
  openUploadPictureBackdrop,
  providerImage,
  providerImageFile,
  providerImageUrl,
  setProviderImage,
  setProviderImageFile,
  setProviderImageUrl,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation("edit-provider");

  const [providerData, setProviderData] = useState(initialData);

  const [isProcessing, setIsProcessing] = useState(false);

  const localizationQuery = useGetCountryAndLanguages();
  const workWithQuery = useGetWorkWithCategories();

  const [errors, setErrors] = useState({});

  const [phonePrefixes, setPhonePrefixes] = useState();
  useEffect(() => {
    const codes = generateCountryCodes();
    if (providerData && !providerData?.phonePrefix) {
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
  }, [providerData]);

  const specializationOptions = [
    { value: "psychologist", label: t("psychologist"), selected: false },
    { value: "psychiatrist", label: t("psychiatrist"), selected: false },
    { value: "psychotherapist", label: t("psychotherapist"), selected: false },
  ];

  const schema = Joi.object({
    name: Joi.string().label(t("name_error")),
    patronym: Joi.string().allow("", null).label(t("patronym_error")),
    surname: Joi.string().label(t("surname_error")),
    nickname: Joi.string().allow("", null).label(t("nickname_error")),
    sex: Joi.string().label(t("sex_error")),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .label(t("email_error")),
    phonePrefix: Joi.string().label(t("phone_prefix_error")),
    phone: Joi.string().label(t("phone_error")),
    image: Joi.string(),
    street: Joi.string().label(t("street_error")),
    city: Joi.string().label(t("city_error")),
    postcode: Joi.string().label(t("postcode_error")),

    specializations: Joi.array().min(1).label(t("specializations_error")),
    consultationPrice: Joi.number().min(0).label(t("consultation_price_error")),
    languages: Joi.array().min(1).label(t("languages_error")),
    education: Joi.array().min(1).label(t("education_error")),
    workWith: Joi.array().min(1).label(t("work_with_error")),
    description: Joi.string().label(t("description_error")),
    totalConsultations: Joi.any(),
    earliestAvailableSlot: Joi.any(),
    videoLink: Joi.string().uri().allow("", null),
  });

  const sexOptions = [
    { label: t("sex_male"), value: "male" },
    { label: t("sex_female"), value: "female" },
    { label: t("sex_unspecified"), value: "unspecified" },
    { label: t("sex_none"), value: "notMentioned" },
  ];

  const getSpecializationsOptions = useCallback(() => {
    if (providerData && providerData.specializations) {
      return specializationOptions.map((option, index) => {
        if (providerData.specializations.includes(option.value)) {
          return {
            ...option,
            selected: true,
            selectedIndex: providerData.specializations.indexOf(option.value),
          };
        }
        return option;
      });
    }
    return specializationOptions;
  }, [providerData]);

  const getLanguageOptions = useCallback(() => {
    const languageOptions = [];
    if (localizationQuery.data && providerData) {
      // Get all language ID's from the provider data
      const providerLanguages = providerData.languages.map(
        (x) => x.language_id || x
      );
      for (let i = 0; i < localizationQuery.data.languages.length; i++) {
        const newLanguageOption = {};
        const language = localizationQuery.data.languages[i];
        // Construct the new object
        newLanguageOption.value = language.language_id;
        newLanguageOption.label = language.name;
        newLanguageOption.selected = providerLanguages.includes(
          language.language_id
        );
        newLanguageOption.selectedIndex = providerLanguages.indexOf(
          language.language_id
        );
        languageOptions.push(newLanguageOption);
      }
    }
    return languageOptions;
  }, [localizationQuery.data, providerData]);

  const getWorkWithOptions = useCallback(() => {
    const workWithOptions = [];
    if (workWithQuery.data && providerData) {
      const providerWorkWith = providerData.workWith.map(
        (x) => x.work_with_id || x
      ); // Get all work with ids from provider data
      for (let i = 0; i < workWithQuery.data.length; i++) {
        const newWorkWith = {};
        const category = workWithQuery.data[i];
        // Construct the new object
        newWorkWith.value = category.work_with_id;
        newWorkWith.label = t(category.topic.replaceAll("-", "_"));
        newWorkWith.selected = providerWorkWith.includes(category.work_with_id);
        newWorkWith.selectedIndex = providerWorkWith.indexOf(
          category.work_with_id
        );
        workWithOptions.push(newWorkWith);
      }
    }
    return workWithOptions;
  }, [workWithQuery.data, providerData]);

  const handleChange = (field, value) => {
    const data = { ...providerData };
    data[field] = value;
    setProviderData(data);
  };

  const handleWorkWithAndLanguageSelect = (field, options) => {
    setErrors({ [field]: null });
    const selected = options
      .filter((option) => option.selected)
      .map((x) => x.value);
    handleChange(field, selected);
  };

  const handleEducationChange = (options) => {
    setErrors({ education: null });
    const data = { ...providerData };
    data.education = options.map((x) => x.value);
    setProviderData(data);
  };

  const handleBlur = (field) => {
    validateProperty(field, providerData[field], schema, setErrors);
  };

  const handleCreateProviderSuccess = () => {
    setIsProcessing(false);
    toast(t("create_success"));
    setProviderData(initialData);
    setProviderImageUrl(null);
    setProviderImage(null);
    setProviderImageFile(null);
    navigate("/providers");
  };
  const uploadImage = async (providerId) => {
    const content = new FormData();
    content.append("fileName", providerId);
    content.append("fileContent", providerImageFile);
    const res = await Promise.all[
      (userSvc.uploadFileAsAdmin(content),
      providerSvc.changeImageAsAdmin(providerId, providerId))
    ];
    return res;
  };

  const uploadImageMutation = useMutation(uploadImage, {
    onSettled: () => {
      handleCreateProviderSuccess();
    },
  });

  const onCreateSuccess = (data) => {
    const providerId = data.user.provider_detail_id;
    if (providerImageFile) {
      uploadImageMutation.mutate(providerId);
    } else {
      handleCreateProviderSuccess();
    }
  };

  const onCreateError = (err) => {
    setIsProcessing(false);
    setErrors({ submit: err });
  };
  const createProviderMutation = useCreateProvider(
    onCreateSuccess,
    onCreateError
  );

  const handleSave = async () => {
    setIsProcessing(true);
    if ((await validate(providerData, schema, setErrors)) === null) {
      createProviderMutation.mutate(providerData);
    } else {
      setIsProcessing(false);
    }
  };

  return (
    <Block classes="create-provider">
      <Grid classes="create-provider__grid">
        <GridItem md={8} lg={4}>
          <ProfilePicturePreview
            image={providerData.image}
            handleDeleteClick={openDeletePictureBackdrop}
            handleChangeClick={openUploadPictureBackdrop}
            changePhotoText={t("change_photo")}
          />
          <Input
            value={providerData.name}
            onChange={(e) => handleChange("name", e.currentTarget.value)}
            errorMessage={errors.name}
            label={t("name_label")}
            placeholder={t("name_placeholder")}
          />
          <Input
            value={providerData.patronym}
            onChange={(e) => handleChange("patronym", e.currentTarget.value)}
            errorMessage={errors.patronym}
            label={t("patronym_label")}
            placeholder={t("patronym_placeholder")}
          />
          <Input
            value={providerData.surname}
            onChange={(e) => handleChange("surname", e.currentTarget.value)}
            errorMessage={errors.surname}
            label={t("surname_label")}
            placeholder={t("surname_placeholder")}
          />
          <Textarea
            value={providerData.description}
            onChange={(value) => handleChange("description", value)}
            errorMessage={errors.description}
            label={t("description_label")}
            placeholder={t("description_placeholder")}
            onBlur={() => handleBlur("description")}
          />
          <Input
            value={providerData.videoLink}
            onChange={(e) => handleChange("videoLink", e.currentTarget.value)}
            label={t("video_link_label")}
            placeholder={t("video_link_placeholder")}
          />
        </GridItem>

        <GridItem md={8} lg={4}>
          <div className="create-provider__grid__phone-container">
            {phonePrefixes && (
              <DropdownWithLabel
                options={phonePrefixes}
                label={t("phone_label")}
                selected={
                  providerData.phonePrefix ||
                  phonePrefixes.find((x) => x.country === usersCountry)?.value
                }
                setSelected={(value) => handleChange("phonePrefix", value)}
                placeholder={t("phone_prefix_placeholder")}
              />
            )}
            <Input
              value={providerData.phone}
              onChange={(e) => handleChange("phone", e.currentTarget.value)}
              placeholder={t("phone_placeholder")}
              onBlur={() => handleBlur("phone")}
              classes="create-provider__grid__phone-container__phone-input"
            />
          </div>
          {errors.phone || errors.phonePrefix ? (
            <Error
              classes="create-provider__grid__phone-error"
              message={errors.phone || errors.phonePrefix}
            />
          ) : null}
          <Input
            value={providerData.email}
            onChange={(e) => handleChange("email", e.currentTarget.value)}
            errorMessage={errors.email}
            label={t("email_label")}
            placeholder={t("email_placeholder")}
            onBlur={() => handleBlur("email")}
          />
          <DropdownWithLabel
            label={t("sex_label")}
            placeholder={t("sex_placeholder")}
            options={sexOptions}
            selected={providerData.sex}
            setSelected={(value) => handleChange("sex", value)}
            classes="create-provider__grid__sex-dropdown"
            errorMessage={errors.sex}
          />
          <Input
            value={providerData.consultationPrice}
            onChange={(e) =>
              handleChange("consultationPrice", e.currentTarget.value)
            }
            errorMessage={errors.consultationPrice}
            label={t("consultation_price_label")}
            placeholder={t("consultation_price_placeholder")}
            onBlur={() => handleBlur("consultationPrice")}
          />
          <Input
            value={providerData.city}
            onChange={(e) => handleChange("city", e.currentTarget.value)}
            errorMessage={errors.city}
            label={t("city_label")}
            placeholder={t("city_placeholder")}
            onBlur={() => handleBlur("city")}
          />
          <Input
            value={providerData.postcode}
            onChange={(e) => handleChange("postcode", e.currentTarget.value)}
            errorMessage={errors.postcode}
            label={t("postcode_label")}
            placeholder={t("postcode_placeholder")}
            onBlur={() => handleBlur("postcode")}
          />
          <Input
            value={providerData.street}
            onChange={(e) => handleChange("street", e.currentTarget.value)}
            errorMessage={errors.street}
            label={t("street_label")}
            placeholder={t("street_placeholder")}
            onBlur={() => handleBlur("street")}
          />
        </GridItem>

        <GridItem md={8} lg={4}>
          <DropdownGroup
            options={getLanguageOptions()}
            handleChange={(languages) =>
              handleWorkWithAndLanguageSelect("languages", languages)
            }
            label={t("language_label")}
            maxShown={5}
            addMoreText={t("add_more_languages")}
            errorMessage={errors.languages}
          />
          <DropdownGroup
            label={t("specialization_label")}
            options={getSpecializationsOptions()}
            handleChange={(options) =>
              handleWorkWithAndLanguageSelect("specializations", options)
            }
            maxShown={specializationOptions.length}
            addMoreText={t("add_more_specializations")}
            errorMessage={errors.specializations}
          />
          <InputGroup
            maxShown={5}
            options={providerData.education}
            label={t("education_label")}
            handleParentChange={(data) => handleEducationChange(data)}
            addMoreText={t("add_more_education")}
            errorMessage={errors.education}
          />
          <DropdownGroup
            options={getWorkWithOptions()}
            handleChange={(workWith) =>
              handleWorkWithAndLanguageSelect("workWith", workWith)
            }
            label={t("work_with_label")}
            maxShown={5}
            addMoreText={t("add_more_work_with")}
            errorMessage={errors.workWith}
          />
        </GridItem>
        {errors.submit ? <Error message={errors.submit} /> : null}

        <GridItem md={8} lg={12} classes="create-provider__grid__button-item">
          <Button
            classes="create-provider__grid__save-button"
            type="primary"
            label={t("create_button_text")}
            size="lg"
            onClick={handleSave}
            disabled={isProcessing}
          />
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
