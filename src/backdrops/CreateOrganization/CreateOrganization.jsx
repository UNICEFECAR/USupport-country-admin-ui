import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import {
  Backdrop,
  Input,
  Textarea,
  Select,
  DropdownWithLabel,
  Loading,
  PlaceInput,
} from "@USupport-components-library/src";
import {
  useEditOrganization,
  useCreateOrganization,
  useGetOrganizationMetadata,
} from "#hooks";

import "./create-organization.scss";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

/**
 * CreateOrganization Modal
 *
 * Fully self-contained modal component for creating and editing organizations
 *
 * @return {jsx}
 */
export const CreateOrganization = ({
  isOpen,
  onClose,
  organizationToEdit,
  onSuccess,
}) => {
  const { t } = useTranslation("blocks", { keyPrefix: "organizations" });
  const queryClient = useQueryClient();
  const country = localStorage.getItem("country");

  let DEFAULT_ORGANIZATION = {
    name: "",
  };

  if (country === "RO") {
    DEFAULT_ORGANIZATION = {
      name: "",
      websiteUrl: "",
      address: "",
      location: { latitude: null, longitude: null },
      phone: "",
      email: "",
      description: "",
      district: null,
      paymentMethods: [],
      userInteractions: [],
      propertyType: [],
      specialisations: [],
    };
  }

  const [data, setData] = useState(DEFAULT_ORGANIZATION);

  const { data: metadata, isLoading: isMetadataLoading } =
    useGetOrganizationMetadata(country);

  useEffect(() => {
    if (organizationToEdit) {
      if (country === "RO") {
        setData({
          name: organizationToEdit.name || "",
          websiteUrl: organizationToEdit.websiteUrl || "",
          address: organizationToEdit.address || "",
          location: {
            latitude: organizationToEdit.location?.latitude || null,
            longitude: organizationToEdit.location?.longitude || null,
          },
          phone: organizationToEdit.phone || "",
          email: organizationToEdit.email || "",
          description: organizationToEdit.description || "",
          district: organizationToEdit.district?.id || "",
          paymentMethods: Array.isArray(organizationToEdit.paymentMethods)
            ? organizationToEdit.paymentMethods.map((pm) => pm.id)
            : [],
          userInteractions: Array.isArray(organizationToEdit.userInteractions)
            ? organizationToEdit.userInteractions.map((ui) => ui.id)
            : [],
          propertyType: Array.isArray(organizationToEdit.propertyTypes)
            ? organizationToEdit.propertyTypes.map((pt) => pt.id)
            : [],
          specialisations: Array.isArray(organizationToEdit.specialisations)
            ? organizationToEdit.specialisations.map((s) => s.id)
            : [],
        });
      } else {
        // For non-RO countries, only set the name field
        setData({
          name: organizationToEdit.name || "",
        });
      }
    } else {
      setData(DEFAULT_ORGANIZATION);
    }
  }, [organizationToEdit, country]);

  useEffect(() => {
    if (!isOpen) {
      setData(DEFAULT_ORGANIZATION);
    }
  }, [isOpen]);

  const onEditSuccess = () => {
    toast.success(t("organization_edited"));
    handleClose();
    queryClient.invalidateQueries({
      queryKey: ["GetOrganizationsWithDetails"],
    });
    onSuccess?.();
  };

  const onCreateSuccess = () => {
    toast.success(t("organization_added"));
    handleClose();
    queryClient.invalidateQueries({
      queryKey: ["GetOrganizationsWithDetails"],
    });
    onSuccess?.();
  };

  const onEditError = (error) => {
    toast.error(
      error || t("organization_edit_error") || "Failed to edit organization"
    );
  };

  const onCreateError = (error) => {
    toast.error(
      error || t("organization_create_error") || "Failed to create organization"
    );
  };

  const editOrganizationMutation = useEditOrganization(
    onEditSuccess,
    onEditError
  );

  const createOrganizationMutation = useCreateOrganization(
    onCreateSuccess,
    onCreateError
  );

  const handleChange = (key, value) => {
    setData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
  };

  const handleDropdownMultipleSelect = (field, options) => {
    const selected = options
      .filter((option) => option.selected)
      .map((x) => x.value);
    handleChange(field, selected);
  };

  const handleSave = (e) => {
    e.preventDefault();

    let organizationData;

    if (country === "RO") {
      // For RO country, include all fields
      organizationData = {
        name: data.name,
        websiteUrl: data.websiteUrl,
        address: data.address,
        location: data.location,
        phone: data.phone,
        email: data.email,
        description: data.description,
        district: data.district,
        paymentMethods: data.paymentMethods,
        userInteractions: data.userInteractions,
        propertyType: data.propertyType,
        specialisations: data.specialisations,
      };
    } else {
      // For non-RO countries, only include the name field
      organizationData = {
        name: data.name,
      };
    }

    const mutation = organizationToEdit
      ? editOrganizationMutation
      : createOrganizationMutation;

    const payload = organizationToEdit
      ? {
          ...organizationData,
          organizationId: organizationToEdit.organizationId,
        }
      : organizationData;

    mutation.mutate(payload);
  };

  const handleClose = () => {
    setData(DEFAULT_ORGANIZATION);
    onClose();
  };

  const isLoading =
    editOrganizationMutation.isLoading || createOrganizationMutation.isLoading;

  const renderForm = () => {
    if (country === "RO" && isMetadataLoading) {
      return <Loading />;
    }

    // For non-RO countries, only show the name field
    if (country !== "RO") {
      return (
        <Input
          label={t("name")}
          value={data.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder={t("name_placeholder")}
          required
        />
      );
    }

    // For RO country, show all fields
    return (
      <>
        <Input
          label={t("name")}
          value={data.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder={t("name_placeholder")}
          required
        />

        <Input
          label={t("website")}
          value={data.websiteUrl}
          onChange={(e) => handleChange("websiteUrl", e.target.value)}
          placeholder={t("website_placeholder")}
        />

        {metadata?.districts && metadata.districts.length > 0 && (
          <DropdownWithLabel
            label={t("district")}
            selected={data.district}
            setSelected={(value) => handleChange("district", value)}
            placeholder={t("district_placeholder")}
            options={metadata.districts.map((district) => ({
              label: t(district.name),
              value: district.districtId,
            }))}
          />
        )}

        <PlaceInput
          label={t("address")}
          value={data.address}
          onPlaceData={(placeData) => {
            handleChange("address", placeData.formattedAddress);
            handleChange("location", {
              latitude: placeData.location.latitude,
              longitude: placeData.location.longitude,
            });
          }}
          placeholder={t("address_placeholder")}
          apiKey={GOOGLE_MAPS_API_KEY}
        />

        <Input
          label={t("phone")}
          value={data.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          placeholder={t("phone_placeholder")}
        />

        <Input
          label={t("email")}
          value={data.email}
          onChange={(e) => handleChange("email", e.target.value)}
          placeholder={t("email_placeholder")}
        />

        {metadata?.specialisations && metadata.specialisations.length > 0 && (
          <Select
            label={t("specialisations")}
            placeholder={t("specialisations_placeholder")}
            options={metadata.specialisations.map((specialisation) => ({
              label: t(specialisation.name),
              value: specialisation.organizationSpecialisationId,
              selected: data.specialisations.includes(
                specialisation.organizationSpecialisationId
              ),
            }))}
            handleChange={(options) =>
              handleDropdownMultipleSelect("specialisations", options)
            }
          />
        )}

        <Textarea
          label={t("description")}
          value={data.description}
          onChange={(text) => handleChange("description", text)}
          placeholder={t("description_placeholder")}
        />

        {metadata?.paymentMethods && metadata.paymentMethods.length > 0 && (
          <Select
            label={t("payment_methods")}
            placeholder={t("payment_methods_placeholder")}
            options={metadata.paymentMethods.map((method) => ({
              label: t(method.name),
              value: method.paymentMethodId,
              selected: data.paymentMethods.includes(method.paymentMethodId),
            }))}
            handleChange={(options) =>
              handleDropdownMultipleSelect("paymentMethods", options)
            }
            classes="create-organizations__select--third"
          />
        )}

        {metadata?.userInteractions && metadata.userInteractions.length > 0 && (
          <Select
            label={t("user_interactions")}
            placeholder={t("user_interactions_placeholder")}
            options={metadata.userInteractions.map((interaction) => ({
              label: t(interaction.name + "_interaction"),
              value: interaction.userInteractionId,
              selected: data.userInteractions.includes(
                interaction.userInteractionId
              ),
            }))}
            handleChange={(options) =>
              handleDropdownMultipleSelect("userInteractions", options)
            }
            classes="create-organizations__select--fourth"
          />
        )}

        {metadata?.propertyTypes && metadata.propertyTypes.length > 0 && (
          <Select
            label={t("property_types")}
            placeholder={t("property_types_placeholder")}
            options={metadata.propertyTypes.map((propertyType) => ({
              label: t(propertyType.name),
              value: propertyType.organizationPropertyTypeId,
              selected: data.propertyType.includes(
                propertyType.organizationPropertyTypeId
              ),
            }))}
            handleChange={(options) =>
              handleDropdownMultipleSelect("propertyType", options)
            }
            classes="create-organizations__select--fifth"
          />
        )}
      </>
    );
  };

  return (
    <Backdrop
      isOpen={isOpen}
      heading={t(
        organizationToEdit ? "edit_organization" : "create_organization"
      )}
      onClose={handleClose}
      classes="create-organizations"
      ctaLabel={organizationToEdit ? t("save") : t("add")}
      ctaHandleClick={handleSave}
      isCtaLoading={isLoading}
      secondaryCtaLabel={t("cancel")}
      secondaryCtaHandleClick={handleClose}
    >
      <form className="create-organizations__form" onSubmit={handleSave}>
        {renderForm()}
      </form>
    </Backdrop>
  );
};
