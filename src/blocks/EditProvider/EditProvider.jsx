import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  Block,
  Box,
  Button,
  DropdownWithLabel,
  Error,
  Input,
  InputGroup,
  Loading,
  ProfilePicturePreview,
  Tabs,
  Textarea,
  InputPhone,
} from "@USupport-components-library/src";

import { validateProperty } from "@USupport-components-library/utils";
import { countrySvc, languageSvc } from "@USupport-components-library/services";

import {
  useGetProviderData,
  useGetCountryAndLanguages,
  useGetWorkWithCategories,
  useUpdateProviderData,
  useGetAllOrganizations,
  useGetProviderTranslations,
} from "#hooks";
import Joi from "joi";

import "./edit-provider.scss";

const PillMultiSelect = ({
  label,
  options,
  onChange,
  errorMessage,
  disabled,
  emptyMessage,
}) => {
  const handleToggle = (targetValue) => {
    if (disabled) {
      return;
    }

    const updatedOptions = options.map((option) => ({
      ...option,
      selected:
        option.value === targetValue ? !option.selected : option.selected,
    }));

    onChange(updatedOptions);
  };

  return (
    <div className="edit-provider__pill-group">
      <p className="text edit-provider__pill-group-label">{label}</p>
      {options.length ? (
        <div className="edit-provider__pill-container">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={[
                "edit-provider__pill",
                option.selected ? "edit-provider__pill--selected" : "",
                disabled ? "edit-provider__pill--disabled" : "",
              ].join(" ")}
              onClick={() => handleToggle(option.value)}
              disabled={disabled}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : (
        <p className="text edit-provider__pill-empty">{emptyMessage}</p>
      )}
      {errorMessage ? <Error message={errorMessage} /> : null}
    </div>
  );
};

const fetchCountryData = async () => {
  const { data } = await countrySvc.getActiveCountries();
  const currentCountryId = localStorage.getItem("country_id");
  const currentCountry = data.find((x) => x.country_id === currentCountryId);
  return currentCountry;
};

const fetchActiveLanguages = async () => {
  const res = await languageSvc.getActiveLanguages();

  return res.data.map((language) => ({
    value: language.alpha2,
    label: language.name,
    id: language.language_id,
    localName: language.local_name,
  }));
};

/**s
 * EditProvider
 *
 * Edit provider profile
 *
 * @return {jsx}
 */
export const EditProvider = ({
  providerId,
  openDeletePictureBackdrop,
  openUploadPictureBackdrop,
  providerImage,
  setProviderImage,
  providerImageUrl,
}) => {
  const currencySymbol = localStorage.getItem("currency_symbol");
  const { t } = useTranslation("blocks", { keyPrefix: "edit-provider" });
  const [providersQuery, providerData, setProviderData] =
    useGetProviderData(providerId);
  const [canSaveChanges, setCanSaveChanges] = useState(false);
  const [errors, setErrors] = useState({});

  // translations: { [language_id]: { name, patronym, surname, nickname, description, education } }
  const [translations, setTranslations] = useState({});
  const translationsQuery = useGetProviderTranslations(providerId);

  useEffect(() => {
    if (translationsQuery.data) {
      setTranslations(translationsQuery.data);
    }
  }, [translationsQuery.data]);

  const { data: countryData } = useQuery(["country-data"], fetchCountryData);
  const selectedCountry = localStorage.getItem("country");
  const { data: countryLanguages } = useQuery(
    ["languages", selectedCountry],
    fetchActiveLanguages,
    {
      staleTime: Infinity,
      enabled: !!selectedCountry,
    }
  );

  const countryMinPrice = countryData?.min_price;
  const hasPayments = countryData?.has_payments;

  useEffect(() => {
    if (providerData && !providerImage) {
      setProviderImage(providerData.image);
    }
  }, [providerData]);

  useEffect(() => {
    setProviderImage(providerImageUrl);
  }, [providerImageUrl]);

  const localizationQuery = useGetCountryAndLanguages();
  const workWithQuery = useGetWorkWithCategories();
  const { data: organizations, isLoading: organizationsLoading } =
    useGetAllOrganizations();
  const [selectedLanguageTab, setSelectedLanguageTab] = useState(null);

  const isPriceDisabled = !hasPayments;

  useEffect(() => {
    if (!countryLanguages?.length) {
      return;
    }

    if (!selectedLanguageTab) {
      setSelectedLanguageTab(countryLanguages[0].id);
    }
  }, [countryLanguages, selectedLanguageTab]);

  const specializationOptions = [
    { value: "psychologist", label: t("psychologist"), selected: false },
    { value: "psychiatrist", label: t("psychiatrist"), selected: false },
    { value: "psychotherapist", label: t("psychotherapist"), selected: false },
  ];

  useEffect(() => {
    if (providerData && providersQuery.data) {
      const providerDataStringified = JSON.stringify(providerData);
      const originalData = JSON.stringify(providersQuery.data);
      const translationsChanged =
        JSON.stringify(translations) !==
        JSON.stringify(translationsQuery.data || {});
      setCanSaveChanges(
        providerDataStringified !== originalData || translationsChanged
      );
    }
  }, [providerData, providersQuery.data, translations, translationsQuery.data]);

  const schema = Joi.object({
    providerDetailId: Joi.string(),
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
    videoLink: Joi.string().uri().allow("", null).label(t("video_link_error")),
    organizations: Joi.array().min(1).label(t("organizations_error")),
    translations: Joi.any(),
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
        const newOrganization = {};
        const organization = organizations[i];
        newOrganization.value = organization.organization_id;
        newOrganization.label = organization.name;
        newOrganization.selected = providerOrganizations.includes(
          organization.organization_id
        );
        newOrganization.selectedIndex = providerOrganizations.indexOf(
          organization.organization_id
        );
        organizationOptions.push(newOrganization);
      }
    }
    return organizationOptions;
  }, [organizations, providerData]);

  const translatableFields = [
    "name",
    "patronym",
    "surname",
    "nickname",
    "description",
    "education",
    "city",
    "street",
  ];

  const selectedLangAlpha2 = (
    countryLanguages?.find((l) => l.id === selectedLanguageTab)?.value || ""
  ).toUpperCase();

  const isDefaultLanguageTab =
    selectedLanguageTab === countryLanguages?.[0]?.id;

  const normalizeTranslatableValue = (field, value) => {
    if (field === "education") {
      return Array.isArray(value) ? value : [];
    }
    return value ?? "";
  };

  // For the default (first) language tab, falls back to base providerData when no translation exists.
  // For all other tabs, returns empty string when no translation exists.
  const getTranslatableValue = (field) => {
    const tabTranslation = translations[selectedLanguageTab];
    if (tabTranslation?.[field] !== undefined) {
      return normalizeTranslatableValue(field, tabTranslation[field]);
    }
    return isDefaultLanguageTab
      ? normalizeTranslatableValue(field, providerData?.[field])
      : normalizeTranslatableValue(field, undefined);
  };

  // Updates the translation for the current language tab
  const handleTranslatableChange = (field, value) => {
    if (!selectedLanguageTab) return;
    setTranslations((prev) => ({
      ...prev,
      [selectedLanguageTab]: {
        ...(prev[selectedLanguageTab] || {}),
        [field]: value,
      },
    }));
  };

  const handleChange = (field, value) => {
    if (translatableFields.includes(field)) {
      handleTranslatableChange(field, value);
      return;
    }
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
    handleTranslatableChange(
      "education",
      options.map((x) => x.value)
    );
  };

  const handleBlur = (field) => {
    if (translatableFields.includes(field)) return;
    validateProperty(field, providerData[field], schema, setErrors);
  };

  const onUpdateSuccess = () => {
    toast(t("edit_success"));
  };

  const onUpdateError = (err, isFutureConsultationError = false) => {
    if (isFutureConsultationError) {
      setErrors({ organizations: err });
      return;
    }
    toast.error(err);
  };
  const updateProviderMutation = useUpdateProviderData(
    onUpdateSuccess,
    onUpdateError
  );

  const handleSave = async () => {
    // Check if the price is lower than the minimum price
    // Allow the admin to save if the price is 0
    const isPriceZero = Number(providerData.consultationPrice) === 0;
    if (
      !isPriceZero &&
      Number(countryMinPrice) > Number(providerData.consultationPrice)
    ) {
      toast.error(
        t("min_price_error", { minPrice: countryMinPrice, currencySymbol })
      );
      return;
    }
    // For non-default language tabs: if any required translatable field is filled,
    // all required translatable fields must be filled before saving.
    const defaultLangId = countryLanguages?.[0]?.id;
    const requiredTranslatableFields = [
      "name",
      "surname",
      "description",
      "education",
      "city",
      "street",
    ];
    const isFieldFilled = (value) =>
      Array.isArray(value)
        ? value.length > 0
        : value != null && String(value).trim() !== "";

    for (const [langId, langTranslations] of Object.entries(translations)) {
      if (langId === defaultLangId) continue;
      const hasAny = requiredTranslatableFields.some((f) =>
        isFieldFilled(langTranslations[f])
      );
      if (hasAny) {
        const missing = requiredTranslatableFields.filter(
          (f) => !isFieldFilled(langTranslations[f])
        );
        if (missing.length > 0) {
          const langCode =
            countryLanguages
              ?.find((l) => l.id === langId)
              ?.value?.toUpperCase() || langId;
          const fieldErrors = {};
          missing.forEach((f) => {
            fieldErrors[f] = t(`${f}_error`);
          });
          setErrors(fieldErrors);
          toast.error(
            t("translation_incomplete_error", {
              lang: langCode,
              fields: missing.join(", "),
              defaultValue: `Please fill all required fields for ${langCode}: ${missing.join(
                ", "
              )}`,
            })
          );
          return;
        }
      }
    }

    const getDefaultLangValue = (field) => {
      const dt = translations[defaultLangId];
      return dt?.[field] !== undefined
        ? normalizeTranslatableValue(field, dt[field])
        : normalizeTranslatableValue(field, providerData?.[field]);
    };

    const payloadWithTranslations = {
      ...providerData,
      name: getDefaultLangValue("name"),
      patronym: getDefaultLangValue("patronym"),
      surname: getDefaultLangValue("surname"),
      nickname: getDefaultLangValue("nickname"),
      description: getDefaultLangValue("description"),
      education: getDefaultLangValue("education"),
      city: getDefaultLangValue("city"),
      street: getDefaultLangValue("street"),
      translations,
    };

    try {
      await schema.validateAsync(payloadWithTranslations, {
        abortEarly: false,
        allowUnknown: true,
      });
      setErrors({});
      updateProviderMutation.mutate(payloadWithTranslations);
    } catch (err) {
      const newErrors = {};
      err.details.forEach((detail) => {
        const key = detail.context.key;
        const msg = detail.context.label;
        if (key && !newErrors[key]) newErrors[key] = msg;
      });
      setErrors(newErrors);
      const firstMsg = Object.values(newErrors)[0];
      if (firstMsg) toast.error(firstMsg);
    }
  };
  const isLoading =
    providersQuery.isLoading ||
    translationsQuery.isLoading ||
    localizationQuery.isLoading ||
    !localizationQuery.data ||
    !providerData;

  const handleDiscard = () => {
    setProviderData(providersQuery.data);
    setTranslations(translationsQuery.data || {});
  };

  const languageTabs = (countryLanguages || []).map((language) => ({
    label: language.localName || language.label,
    value: language.id,
    isSelected: selectedLanguageTab === language.id,
  }));

  const handleLanguageTabSelect = (index) => {
    const selectedTab = languageTabs[index];
    if (selectedTab) {
      setSelectedLanguageTab(selectedTab.value);
    }
  };

  return (
    <Block classes="edit-provider">
      {isLoading ? (
        <Loading size="lg" />
      ) : (
        <div className="edit-provider__content">
          <div className="edit-provider__tabs">
            <Tabs
              options={languageTabs}
              handleSelect={handleLanguageTabSelect}
            />
          </div>

          <Box
            classes="edit-provider__section edit-provider__section--profile"
            boxShadow={3}
          >
            <h3 className="edit-provider__section-title">
              {t("section_personal_information", {
                defaultValue: "Personal information",
              })}
            </h3>
            <div className="edit-provider__section-grid edit-provider__section-grid--profile">
              <div className="edit-provider__profile-preview-row">
                <ProfilePicturePreview
                  image={providerData.image}
                  imageFile={providerImageUrl}
                  handleDeleteClick={openDeletePictureBackdrop}
                  handleChangeClick={openUploadPictureBackdrop}
                  changePhotoText={t("change_photo")}
                  providerId={providerData.providerDetailId}
                />
              </div>
              <div>
                <Input
                  value={getTranslatableValue("name")}
                  onChange={(e) => handleChange("name", e.currentTarget.value)}
                  errorMessage={errors.name}
                  label={`${t("name_label")} ${selectedLangAlpha2} *`}
                  placeholder={t("name_placeholder")}
                />
                <Input
                  value={getTranslatableValue("patronym")}
                  onChange={(e) =>
                    handleChange("patronym", e.currentTarget.value)
                  }
                  errorMessage={errors.patronym}
                  label={`${t("patronym_label")} ${selectedLangAlpha2}`}
                  placeholder={t("patronym_placeholder")}
                />
                <Input
                  value={getTranslatableValue("surname")}
                  onChange={(e) =>
                    handleChange("surname", e.currentTarget.value)
                  }
                  errorMessage={errors.surname}
                  label={`${t("surname_label")} ${selectedLangAlpha2} *`}
                  placeholder={t("surname_placeholder")}
                />
              </div>
              <div>
                <InputPhone
                  label={t("phone_label") + " *"}
                  placeholder={t("phone_placeholder")}
                  value={providerData.phone}
                  onChange={(value) => handleChange("phone", value)}
                  onBlur={() => handleBlur("phone")}
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
                  classes="edit-provider__grid__sex-dropdown"
                  errorMessage={errors.sex}
                />
              </div>
            </div>
          </Box>

          <Box classes="edit-provider__section" boxShadow={3}>
            <h3 className="edit-provider__section-title">
              {t("section_professional_information", {
                defaultValue: "Professional information",
              })}
            </h3>
            <div className="edit-provider__section-grid">
              <Textarea
                value={getTranslatableValue("description")}
                onChange={(value) => handleChange("description", value)}
                errorMessage={errors.description}
                label={`${t("description_label")} ${selectedLangAlpha2} *`}
                placeholder={t("description_placeholder")}
                onBlur={() => handleBlur("description")}
              />
              <Input
                value={providerData.videoLink}
                onChange={(e) =>
                  handleChange("videoLink", e.currentTarget.value)
                }
                errorMessage={errors.videoLink}
                label={t("video_link_label")}
                placeholder={t("video_link_placeholder")}
                onBlur={() => handleBlur("videoLink")}
              />
              <div className="edit-provider__consultation-price-group">
                <Input
                  value={providerData.consultationPrice}
                  onChange={(e) =>
                    handleChange("consultationPrice", e.currentTarget.value)
                  }
                  errorMessage={errors.consultationPrice}
                  label={
                    t("consultation_price_label", { currencySymbol }) + " *"
                  }
                  placeholder={t("consultation_price_placeholder")}
                  onBlur={() => handleBlur("consultationPrice")}
                  disabled={isPriceDisabled}
                />
                {isPriceDisabled ? (
                  <Error message={t("consultation_price_disabled")} />
                ) : null}
              </div>
              <InputGroup
                maxShown={5}
                options={getTranslatableValue("education") || []}
                label={`${t("education_label")} ${selectedLangAlpha2}`}
                handleParentChange={(data) => handleEducationChange(data)}
                addMoreText={t("add_more_education")}
                removeText={t("remove")}
                errorMessage={errors.education}
              />
            </div>
          </Box>

          <Box classes="edit-provider__section" boxShadow={3}>
            <h3 className="edit-provider__section-title">
              {t("section_location", { defaultValue: "Location" })}
            </h3>
            <div className="edit-provider__section-grid">
              <Input
                value={getTranslatableValue("city")}
                onChange={(e) => handleChange("city", e.currentTarget.value)}
                errorMessage={errors.city}
                label={`${t("city_label")} ${selectedLangAlpha2} *`}
                placeholder={t("city_placeholder")}
                onBlur={() => handleBlur("city")}
              />
              <Input
                value={providerData.postcode}
                onChange={(e) =>
                  handleChange("postcode", e.currentTarget.value)
                }
                errorMessage={errors.postcode}
                label={t("postcode_label") + " *"}
                placeholder={t("postcode_placeholder")}
                onBlur={() => handleBlur("postcode")}
              />
              <Input
                value={getTranslatableValue("street")}
                onChange={(e) => handleChange("street", e.currentTarget.value)}
                errorMessage={errors.street}
                label={`${t("street_label")} ${selectedLangAlpha2} *`}
                placeholder={t("street_placeholder")}
                onBlur={() => handleBlur("street")}
              />
            </div>
          </Box>

          <Box classes="edit-provider__section" boxShadow={3}>
            <h3 className="edit-provider__section-title">
              {t("section_languages_specialties", {
                defaultValue: "Languages, specialties and organizations",
              })}
            </h3>
            <div className="edit-provider__section-grid edit-provider__section-grid--languages">
              <PillMultiSelect
                label={t("language_label") + " *"}
                options={getLanguageOptions()}
                onChange={(languages) =>
                  handleWorkWithAndLanguageSelect("languages", languages)
                }
                errorMessage={errors.languages}
                emptyMessage={t("no_data_found")}
              />
              <PillMultiSelect
                label={t("specialization_label") + " *"}
                options={getSpecializationsOptions()}
                onChange={(options) =>
                  handleWorkWithAndLanguageSelect("specializations", options)
                }
                errorMessage={errors.specializations}
                emptyMessage={t("no_data_found")}
              />
              <PillMultiSelect
                label={t("work_with_label") + " *"}
                options={getWorkWithOptions()}
                onChange={(workWith) =>
                  handleWorkWithAndLanguageSelect("workWith", workWith)
                }
                errorMessage={errors.workWith}
                emptyMessage={t("no_data_found")}
              />
              <PillMultiSelect
                label={t("organizations_label") + " *"}
                options={getOrganizationOptions()}
                onChange={(organizationsSelection) =>
                  handleWorkWithAndLanguageSelect(
                    "organizations",
                    organizationsSelection
                  )
                }
                errorMessage={errors.organizations}
                disabled={organizationsLoading}
                emptyMessage={t("no_data_found")}
              />
            </div>
          </Box>

          <div className="edit-provider__buttons">
            <Button
              classes="edit-provider__grid__save-button"
              type="primary"
              label={t("button_text")}
              size="lg"
              onClick={handleSave}
              disabled={!canSaveChanges}
              loading={updateProviderMutation.isLoading}
            />
            <Button
              type="secondary"
              classes="edit-provider__grid__discard-button"
              label={t("button_secondary_text")}
              size="lg"
              disabled={!canSaveChanges}
              onClick={handleDiscard}
            />
          </div>
        </div>
      )}
    </Block>
  );
};
