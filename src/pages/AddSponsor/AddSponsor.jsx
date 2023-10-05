import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { Page, AddSponsor as AddSponsorBlock } from "#blocks";

import { UploadPicture } from "#backdrops";

import "./add-sponsor.scss";
import { useNavigate } from "react-router-dom";

/**
 * AddSponsor
 *
 * Add sponsor page
 *
 * @returns {JSX.Element}
 */
export const AddSponsor = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("add-sponsor-page");
  const [isUploadPictureBackdropOpen, setIsUploadPictureBackdropOpen] =
    useState(false);

  const [sponsorImage, setSponsorImage] = useState();
  const [sponsorImageFile, setSponsorImageFile] = useState();
  const [sponsorImageUrl] = useState();

  const handleUploadFile = (data) => {
    setSponsorImage(data.imageAsUrl);
    setSponsorImageFile(data.imageFile);
  };

  return (
    <Page
      handleGoBack={() => navigate(-1)}
      heading={t("heading")}
      classes="page__add-sponsor"
    >
      <AddSponsorBlock
        openUploadPicture={() => setIsUploadPictureBackdropOpen(true)}
        sponsorImage={sponsorImage}
        sponsorImageFile={sponsorImageFile}
        sponsorImageUrl={sponsorImageUrl}
      />
      <UploadPicture
        isOpen={isUploadPictureBackdropOpen}
        onClose={() => setIsUploadPictureBackdropOpen(false)}
        handleUploadFile={handleUploadFile}
        targetImage={sponsorImage}
      />
    </Page>
  );
};
