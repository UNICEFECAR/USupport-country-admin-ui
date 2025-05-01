import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Page, AddSponsor as AddSponsorBlock } from "#blocks";
import { useCustomNavigate as useNavigate } from "#hooks";
import { UploadPicture } from "#backdrops";

import "./edit-sponsor.scss";

/**
 * EditSponsor
 *
 * Edit sponsor page
 *
 * @returns {JSX.Element}
 */
export const EditSponsor = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("edit-sponsor-page");

  const [isUploadPictureBackdropOpen, setIsUploadPictureBackdropOpen] =
    useState(false);

  const [sponsorImage, setSponsorImage] = useState();
  const [sponsorImageUrl, setSponsorImageUrl] = useState();

  const sponsorId = new URLSearchParams(window.location.search).get(
    "sponsorId"
  );

  if (!sponsorId)
    return (
      <Navigate
        to={`/country-admin/${localStorage.getItem("language")}/campaigns`}
      />
    );

  return (
    <Page
      handleGoBack={() => navigate(-1)}
      heading={t("heading")}
      classes="page__edit-sponsor"
    >
      <AddSponsorBlock
        openUploadPicture={() => setIsUploadPictureBackdropOpen(true)}
        sponsorId={sponsorId}
        sponsorImage={sponsorImageUrl}
        setSponsorImage={setSponsorImage}
        isEditing={true}
      />
      <UploadPicture
        isOpen={isUploadPictureBackdropOpen}
        onClose={() => setIsUploadPictureBackdropOpen(false)}
        targetImage={sponsorImage}
        fileName={`sponsor-${sponsorId}`}
        setTargetImageUrl={setSponsorImageUrl}
      />
    </Page>
  );
};
