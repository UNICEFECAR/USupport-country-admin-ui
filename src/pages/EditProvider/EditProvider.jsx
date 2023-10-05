import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Page, EditProvider as EditProvierBlock } from "#blocks";
import { UploadPicture, DeleteProfilePicture } from "#backdrops";

import "./edit-provider.scss";

/**
 * EditProvider
 *
 * Edit provider profile
 *
 * @returns {JSX.Element}
 */
export const EditProvider = () => {
  const navigate = useNavigate();
  const providerId = new URLSearchParams(window.location.search).get("id");
  if (!providerId) return <Navigate to="/providers" />;

  const [providerImage, setProviderImage] = useState();
  const [providerImageUrl, setProviderImageUrl] = useState();

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

  const handleGoBack = () => navigate(-1);

  return (
    <Page classes="page__edit-provider" handleGoBack={handleGoBack}>
      <EditProvierBlock
        {...{
          openUploadPictureBackdrop,
          openDeletePictureBackdrop,
          providerId,
          providerImage,
          setProviderImage,
          providerImageUrl,
        }}
      />

      <UploadPicture
        isOpen={isUploadPictureBackdropOpen}
        onClose={closeUploadPictureBackdrop}
        targetImage={providerImage}
        setProviderImage={setProviderImage}
        setTargetImageUrl={setProviderImageUrl}
        fileName={providerId}
        providerId={providerId}
      />
      <DeleteProfilePicture
        isOpen={isDeletePictureBackdropShown}
        onClose={closeDeletePictureBackdrop}
        providerId={providerId}
        setProviderImageUrl={setProviderImageUrl}
      />
    </Page>
  );
};
