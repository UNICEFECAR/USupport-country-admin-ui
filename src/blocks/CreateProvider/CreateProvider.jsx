import React, { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";
import Joi from "joi";
import { useCustomNavigate as useNavigate } from "#hooks";

import {
  Block,
  Button,
  DropdownWithLabel,
  Error,
  Grid,
  GridItem,
  Input,
  InputGroup,
  ProfilePicturePreview,
  Textarea,
  InputPhone,
  Select,
} from "@USupport-components-library/src";
import { validate, validateProperty } from "@USupport-components-library/utils";
import { userSvc, providerSvc } from "@USupport-components-library/services";

import {
  useGetCountryAndLanguages,
  useGetWorkWithCategories,
  useCreateProvider,
  useGetAllOrganizations,
} from "#hooks";

import "./create-provider.scss";

const initialData = {
  name: "",
  patronym: "",
  surname: "",
  nickname: "",
  email: "",
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
  organizations: [],
};

const COUNTRIES_WITH_DISABLED_PRICE = ["KZ", "PL"];

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
  providerImageFile,
  providerImageUrl,
  setProviderImage,
  setProviderImageFile,
  setProviderImageUrl,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation("edit-provider");
  const currencySymbol = localStorage.getItem("currency_symbol");

  const [providerData, setProviderData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [countryAlpha2, setCountryAlpha2] = useState("");

  const localizationQuery = useGetCountryAndLanguages();
  const workWithQuery = useGetWorkWithCategories();
  const { data: organizations, isLoading: organizationsLoading } =
    useGetAllOrganizations();

  const isPriceDisabled = COUNTRIES_WITH_DISABLED_PRICE.includes(countryAlpha2);

  useEffect(() => {
    if (localizationQuery.data) {
      const currentCountryId = localStorage.getItem("country_id");
      const currentCountry = localizationQuery.data.countries.find(
        (x) => x.country_id === currentCountryId
      );
      console.log(currentCountry, "currentCountry");
      setCountryAlpha2(currentCountry.alpha2);
    }
  }, [localizationQuery.data]);

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
    organizations: Joi.array().min(1).label(t("organizations_error")),
  });

  const sexOptions = [
    { label: t("sex_male"), value: "male" },
    { label: t("sex_female"), value: "female" },
    { label: t("sex_unspecified"), value: "unspecified" },
    { label: t("sex_none"), value: "notMentioned" },
  ];

  const getSpecializationsOptions = useCallback(() => {
    if (providerData && providerData.specializations) {
      return specializationOptions.map((option) => {
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
        newLanguageOption.label =
          language.name === "English"
            ? language.name
            : `${language.name} (${language.local_name})`;
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

  const getOrganizationOptions = useCallback(() => {
    const organizationOptions = [];
    if (organizations && providerData) {
      const providerOrganizations = providerData.organizations.map(
        (x) => x.organization_id || x
      );
      for (let i = 0; i < organizations.length; i++) {
        const newOrganizationOption = {};
        const organization = organizations[i];
        newOrganizationOption.value = organization.organization_id;
        newOrganizationOption.label = organization.name;
        newOrganizationOption.selected = providerOrganizations.includes(
          organization.organization_id
        );
        newOrganizationOption.selectedIndex = providerOrganizations.indexOf(
          organization.organization_id
        );
        organizationOptions.push(newOrganizationOption);
      }
    }
    return organizationOptions;
  });

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
    setErrors({ submit: err });
  };
  const createProviderMutation = useCreateProvider(
    onCreateSuccess,
    onCreateError
  );

  const handleSave = async () => {
    if ((await validate(providerData, schema, setErrors)) === null) {
      createProviderMutation.mutate(providerData);
    }
  };

  return (
    <Block classes="create-provider">
      <Grid classes="create-provider__grid">
        <GridItem md={8} lg={4}>
          <ProfilePicturePreview
            image={providerData.image}
            imageFile={providerImageUrl}
            handleDeleteClick={openDeletePictureBackdrop}
            handleChangeClick={openUploadPictureBackdrop}
            changePhotoText={t("change_photo")}
          />
          <Input
            value={providerData.name}
            onChange={(e) => handleChange("name", e.currentTarget.value)}
            errorMessage={errors.name}
            label={t("name_label") + " *"}
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
            label={t("surname_label") + " *"}
            placeholder={t("surname_placeholder")}
          />
          <Textarea
            value={providerData.description}
            onChange={(value) => handleChange("description", value)}
            errorMessage={errors.description}
            label={t("description_label") + " *"}
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
          <InputPhone
            label={t("phone_label") + " *"}
            placeholder={t("phone_placeholder")}
            value={providerData.phone}
            onChange={(value) => handleChange("phone", value)}
            searchPlaceholder={t("search")}
            errorMessage={errors.phone}
            searchNotFound={t("no_entries_found")}
            classes="add-sponsor__grid__phone"
          />
          <Input
            value={providerData.email}
            onChange={(e) => handleChange("email", e.currentTarget.value)}
            errorMessage={errors.email}
            label={t("email_label") + " *"}
            placeholder={t("email_placeholder")}
            onBlur={() => handleBlur("email")}
          />
          <DropdownWithLabel
            label={t("sex_label") + " *"}
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
            label={t("consultation_price_label", { currencySymbol }) + " *"}
            placeholder={t("consultation_price_placeholder")}
            onBlur={() => handleBlur("consultationPrice")}
            disabled={isPriceDisabled}
          />
          {isPriceDisabled && (
            <Error message={t("consultation_price_disabled")} />
          )}
          <Input
            value={providerData.city}
            onChange={(e) => handleChange("city", e.currentTarget.value)}
            errorMessage={errors.city}
            label={t("city_label") + " *"}
            placeholder={t("city_placeholder")}
            onBlur={() => handleBlur("city")}
          />
          <Input
            value={providerData.postcode}
            onChange={(e) => handleChange("postcode", e.currentTarget.value)}
            errorMessage={errors.postcode}
            label={t("postcode_label") + " *"}
            placeholder={t("postcode_placeholder")}
            onBlur={() => handleBlur("postcode")}
          />
          <Input
            value={providerData.street}
            onChange={(e) => handleChange("street", e.currentTarget.value)}
            errorMessage={errors.street}
            label={t("street_label") + " *"}
            placeholder={t("street_placeholder")}
            onBlur={() => handleBlur("street")}
          />
        </GridItem>

        <GridItem md={8} lg={4}>
          <Select
            placeholder={t("select")}
            options={getLanguageOptions()}
            handleChange={(languages) =>
              handleWorkWithAndLanguageSelect("languages", languages)
            }
            label={t("language_label") + " *"}
            maxShown={5}
            addMoreText={t("add_more_languages")}
            errorMessage={errors.languages}
          />
          <Select
            placeholder={t("select")}
            label={t("specialization_label") + " *"}
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
            removeText={t("remove")}
            errorMessage={errors.education}
          />
          <Select
            placeholder={t("select")}
            label={t("work_with_label") + " *"}
            options={getWorkWithOptions()}
            handleChange={(workWith) => {
              handleWorkWithAndLanguageSelect("workWith", workWith);
            }}
            errorMessage={errors.workWith}
          />
          <Select
            placeholder={t("select")}
            options={getOrganizationOptions()}
            disabled={organizationsLoading}
            handleChange={(organizations) =>
              handleWorkWithAndLanguageSelect("organizations", organizations)
            }
            label={t("organizations_label") + " *"}
            maxShown={5}
            addMoreText={t("add_more_organizations")}
            errorMessage={errors.organizations}
          />
        </GridItem>
        <GridItem md={8} lg={12} classes="create-provider__grid__button-item">
          {errors.submit ? <Error message={errors.submit} /> : null}
        </GridItem>

        <GridItem md={8} lg={12} classes="create-provider__grid__button-item">
          <Button
            classes="create-provider__grid__save-button"
            type="primary"
            label={t("create_button_text")}
            size="lg"
            onClick={handleSave}
            loading={
              uploadImageMutation.isLoading || createProviderMutation.isLoading
            }
          />
        </GridItem>
      </Grid>
    </Block>
  );
};
