import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useCustomNavigate as useNavigate } from "#hooks";
import Joi from "joi";
import { toast } from "react-toastify";

import {
  Block,
  Button,
  Error,
  Grid,
  GridItem,
  ProfilePicturePreview,
  Input,
  InputPhone,
} from "@USupport-components-library/src";

import { validate } from "@USupport-components-library/utils";

import { userSvc } from "@USupport-components-library/services";

import { useGetSponsorData, useAddSponsor, useUpdateSponsor } from "#hooks";

import "./add-sponsor.scss";

/**
 * AddSponsor
 *
 * Add sponsor block
 *
 * @return {jsx}
 */
export const AddSponsor = ({
  sponsorId,
  openUploadPicture,
  sponsorImage,
  sponsorImageFile,
  setSponsorImage,
  isEditing = false,
}) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { t } = useTranslation("add-sponsor");

  const sponsorDataQuery = useGetSponsorData(sponsorId);
  const sponsorData = sponsorDataQuery.data;

  const schema = Joi.object({
    name: Joi.string().required().label(t("sponsor_error")),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .label(t("email_error")),
    phone: Joi.string().label(t("phone_error")),
    image: Joi.string().allow("", null),
  });

  const [data, setData] = useState({
    name: sponsorData ? sponsorData.name : "",
    email: sponsorData ? sponsorData.email : "",
    phone: sponsorData ? sponsorData.phone : "",
    image: sponsorData ? sponsorData.image : "default-sponsor",
  });

  const setDataToDataInQuery = () => {
    setData({
      name: sponsorData.sponsorName,
      email: sponsorData.email,
      phone: sponsorData.phone,
      image: sponsorData.image,
    });
  };
  useEffect(() => {
    if (sponsorId && sponsorData) {
      setDataToDataInQuery();
      setSponsorImage(sponsorData.image);
    }
  }, [sponsorId, sponsorData]);

  const [hasUploadedImage, setHasUploadedImage] = useState(false);
  const [errors, setErrors] = useState("");

  const [canSaveChanges, setCanSaveChanges] = useState(false);

  useEffect(() => {
    // Compare current data with data coming from DB to check if the changes can be saved
    const oldData = JSON.stringify({
      sponsor: sponsorData?.sponsor,
      email: sponsorData?.email,
      phone: sponsorData?.phone,
    });
    const currentData = JSON.stringify(data);

    setCanSaveChanges(oldData !== currentData);
  }, [data]);

  const handleChange = (name, value) => {
    setData({ ...data, [name]: value });
  };

  const uploadImage = async (sponsorId) => {
    const imageName = `sponsor-${sponsorId}`;
    const content = new FormData();
    content.append("fileName", imageName);
    content.append("fileContent", sponsorImageFile);
    const res = await userSvc.uploadFileAsAdmin(content);

    updateSponsorMutation.mutate({
      ...data,
      image: imageName,
      sponsorId: sponsorId,
    });
    return res;
  };

  const uploadImageMutation = useMutation(uploadImage, {
    onSuccess: () => setHasUploadedImage(true),
    onSettled: () => navigate("/campaigns"),
  });
  const onCreateSuccess = (data) => {
    const sponsorId = data.sponsor_id;
    if (sponsorImage && !hasUploadedImage) {
      uploadImageMutation.mutate(sponsorId);
    } else {
      toast(t("success"));
      navigate("/campaigns");
    }
    queryClient.inavlidateQueries({ queryKey: ["sponsor-data"] });
  };
  const onCreateError = (error) => setErrors({ submit: error });
  const addSponsorMutation = useAddSponsor(onCreateSuccess, onCreateError);

  const handleCreate = async () => {
    if ((await validate(data, schema, setErrors)) === null) {
      addSponsorMutation.mutate(data);
    }
  };

  const onUpdateSuccess = () => {
    if (!sponsorImage || hasUploadedImage || isEditing) {
      toast(t("edit_success"));
      if (isEditing) {
        navigate(-1);
      }
    } else {
      if (sponsorId) {
        uploadImageMutation.mutate(sponsorId);
      }
    }
  };
  const onUpdateError = (error) => setErrors({ submit: error });
  const updateSponsorMutation = useUpdateSponsor(
    onUpdateSuccess,
    onUpdateError
  );
  const handleSaveChanges = async () => {
    if ((await validate(data, schema, setErrors)) === null) {
      const updatedData = {
        ...data,
        sponsorId,
      };
      if (sponsorImage) {
        updatedData.image = `sponsor-${sponsorId}`;
      }
      updateSponsorMutation.mutate(updatedData);
    }
  };

  const handleDiscardChanges = () => {
    setDataToDataInQuery();
  };

  return (
    <Block classes="add-sponsor">
      <Grid classes="add-sponsor__grid">
        <GridItem md={8} lg={12}>
          <ProfilePicturePreview
            image={data.image || "default-sponsor"}
            changePhotoText={t("select_photo")}
            handleChangeClick={openUploadPicture}
            imageFile={sponsorImage}
          />
          <Input
            value={data.name}
            onChange={(e) => handleChange("name", e.currentTarget.value)}
            errorMessage={errors.name}
            label={t("sponsor_label") + " *"}
            placeholder={t("sponsor_placeholder")}
          />
          <Input
            value={data.email}
            onChange={(e) => handleChange("email", e.currentTarget.value)}
            errorMessage={errors.email}
            label={t("email_label") + " *"}
            placeholder={t("email_placeholder")}
          />
          <InputPhone
            label={t("phone_label")}
            placeholder={t("phone_placeholder")}
            value={data.phone}
            onChange={(value) => handleChange("phone", value)}
            searchPlaceholder={t("search")}
            errorMessage={errors.phone}
            searchNotFound={t("no_entries_found")}
            classes="add-sponsor__grid__phone"
          />
          {errors.submit ? (
            <Error
              classes="add-sponsor__grid__phone-error"
              message={errors.submit}
            />
          ) : null}
          {!sponsorData ? (
            <Button
              label={t("create_sponsor")}
              onClick={handleCreate}
              size="lg"
              classes="add-sponsor__grid__create-button"
              loading={
                addSponsorMutation.isLoading || uploadImageMutation.isLoading
              }
            />
          ) : (
            <>
              <Button
                label={t("save_changes")}
                disabled={!canSaveChanges}
                loading={
                  updateSponsorMutation.isLoading ||
                  uploadImageMutation.isLoading
                }
                onClick={handleSaveChanges}
                size="lg"
                classes="add-sponsor__grid__create-button"
              />

              <Button
                label={t("discard_changes")}
                onClick={handleDiscardChanges}
                size="lg"
                classes="add-sponsor__grid__create-button"
                type="secondary"
                color="green"
              />
            </>
          )}
        </GridItem>
      </Grid>
    </Block>
  );
};
