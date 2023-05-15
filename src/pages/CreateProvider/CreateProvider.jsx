import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Page, CreateProvider as CreateProviderBlock } from "#blocks";
import { UploadPicture, DeleteProfilePicture } from "#backdrops";

import "./create-provider.scss";

/**
 * CreateProvider
 *
 * Create provider page
 *
 * @returns {JSX.Element}
 */
export const CreateProvider = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("create-provider-page");

  const [providerImage, setProviderImage] = useState();
  const [providerImageUrl, setProviderImageUrl] = useState();
  const [providerImageFile, setProviderImageFile] = useState();

  const [isUploadPictureBackdropOpen, setIsUploadPictureBackdropOpen] =
    useState(false);
  const [isDeletePictureBackdropShown, setIsDeletePictureBackdropShown] =
    useState(false);

  const openUploadPictureBackdrop = () => setIsUploadPictureBackdropOpen(true);
  const openDeletePictureBackdrop = () => setIsDeletePictureBackdropShown(true);

  const closeUploadPictureBackdrop = () =>
    setIsUploadPictureBackdropOpen(false);
  const closeDeletePictureBackdrop = () =>
    setIsDeletePictureBackdropShown(false);

  const handleGoBack = () => navigate("/providers");
  const handleUploadFile = (data) => {
    setProviderImageFile(data.imageFile);
    setProviderImageUrl(data.imageAsUrl);
  };
  const handleDeleteFile = () => {
    setProviderImage(null);
    setProviderImageFile(null);
    setProviderImageUrl(null);
  };

  return (
    <Page
      classes="page__create-provider"
      heading={t("heading")}
      handleGoBack={handleGoBack}
    >
      <CreateProviderBlock
        {...{
          openUploadPictureBackdrop,
          openDeletePictureBackdrop,
          providerImage,
          providerImageFile,
          providerImageUrl,
          setProviderImage,
          setProviderImageFile,
          setProviderImageUrl,
        }}
      />
      <UploadPicture
        isOpen={isUploadPictureBackdropOpen}
        onClose={closeUploadPictureBackdrop}
        handleUploadFile={handleUploadFile}
        targetImage={providerImage}
      />
      <DeleteProfilePicture
        isOpen={isDeletePictureBackdropShown}
        onClose={closeDeletePictureBackdrop}
        setProviderImage={setProviderImage}
        handleDeleteFile={handleDeleteFile}
      />
    </Page>
  );
};
