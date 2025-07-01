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
  const { t } = useTranslation("organizations");
  const queryClient = useQueryClient();
  const country = localStorage.getItem("country");

  let DEFAULT_ORGANIZATION = {
    name: "",
  };

  if (country === "RO") {
    DEFAULT_ORGANIZATION = {
      name: "",
      unitName: "",
      websiteUrl: "",
      address: "",
      location: { latitude: null, longitude: null },
      phone: "",
      email: "",
      description: "",
      workWith: [],
      district: null,
      paymentMethod: null,
      userInteraction: null,
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
          unitName: organizationToEdit.unitName || "",
          websiteUrl: organizationToEdit.websiteUrl || "",
          address: organizationToEdit.address || "",
          location: {
            latitude: organizationToEdit.location?.latitude || null,
            longitude: organizationToEdit.location?.longitude || null,
          },
          phone: organizationToEdit.phone || "",
          email: organizationToEdit.email || "",
          description: organizationToEdit.description || "",
          workWith: Array.isArray(organizationToEdit.workWith)
            ? organizationToEdit.workWith.map((w) => w.id)
            : [],
          district: organizationToEdit.district?.id || "",
          paymentMethod: organizationToEdit.paymentMethod?.id || "",
          userInteraction: organizationToEdit.userInteraction?.id || "",
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
    toast.error(t("organization_edit_error") || "Failed to edit organization");
    console.error("Edit organization error:", error);
  };

  const onCreateError = (error) => {
    toast.error(
      t("organization_create_error") || "Failed to create organization"
    );
    console.error("Create organization error:", error);
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
        unitName: data.unitName,
        websiteUrl: data.websiteUrl,
        address: data.address,
        location: data.location,
        phone: data.phone,
        email: data.email,
        description: data.description,
        workWith: data.workWith,
        district: data.district,
        paymentMethod: data.paymentMethod,
        userInteraction: data.userInteraction,
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

  console.log(data);

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
          label={t("unit_name")}
          value={data.unitName}
          onChange={(e) => handleChange("unitName", e.target.value)}
          placeholder={t("unit_name_placeholder")}
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

        <Textarea
          label={t("description")}
          value={data.description}
          onChange={(text) => handleChange("description", text)}
          placeholder={t("description_placeholder")}
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

        {metadata?.workWith && metadata.workWith.length > 0 && (
          <Select
            label={t("work_with")}
            placeholder={t("work_with_placeholder")}
            options={metadata.workWith.map((item) => ({
              label: t(item.topic),
              value: item.organizationWorkWithId,
              selected: data.workWith.includes(item.organizationWorkWithId),
            }))}
            handleChange={(options) =>
              handleDropdownMultipleSelect("workWith", options)
            }
            classes="create-organizations__select--second"
          />
        )}

        {metadata?.paymentMethods && metadata.paymentMethods.length > 0 && (
          <DropdownWithLabel
            label={t("payment_method")}
            selected={data.paymentMethod}
            setSelected={(value) => handleChange("paymentMethod", value)}
            placeholder={t("payment_method_placeholder")}
            options={metadata.paymentMethods.map((method) => ({
              label: t(method.name),
              value: method.paymentMethodId,
            }))}
          />
        )}

        {metadata?.userInteractions && metadata.userInteractions.length > 0 && (
          <DropdownWithLabel
            label={t("user_interaction")}
            selected={data.userInteraction}
            setSelected={(value) => handleChange("userInteraction", value)}
            placeholder={t("user_interaction_placeholder")}
            options={metadata.userInteractions.map((interaction) => ({
              label: t(interaction.name + "_interaction"),
              value: interaction.userInteractionId,
            }))}
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
