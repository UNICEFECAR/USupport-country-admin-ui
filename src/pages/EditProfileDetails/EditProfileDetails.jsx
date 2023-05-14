import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Page, EditProfileDetails as EditProfileDetailsBlock } from "#blocks";
import { ChangePassword } from "#backdrops";

import "./edit-profile-details.scss";

/**
 * EditProfileDetails
 *
 * Edit profile details page
 *
 * @returns {JSX.Element}
 */
export const EditProfileDetails = () => {
  const { t } = useTranslation("edit-profile-details-page");
  const navigate = useNavigate();
  const [showChangePassword, setShowChangePassword] = useState(false);

  const handleGoBack = () => navigate("/profile");

  return (
    <Page
      classes="page__edit-profile-details"
      heading={t("heading")}
      handleGoBack={handleGoBack}
    >
      <EditProfileDetailsBlock
        openChangePassword={() => setShowChangePassword(true)}
      />
      <ChangePassword
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
    </Page>
  );
};
