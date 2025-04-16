import React from "react";
import { useCustomNavigate as useNavigate } from "#hooks";
import { useTranslation } from "react-i18next";
import { Page, AdminProfile as AdminProfileBlock } from "#blocks";
import { ButtonWithIcon, RadialCircle } from "@USupport-components-library/src";
import { useWindowDimensions } from "@USupport-components-library/utils";
import { adminSvc } from "@USupport-components-library/services";
import "./admin-profile.scss";

/**
 * AdminProfile
 *
 * AdminProfile page
 *
 * @returns {JSX.Element}
 */
export const AdminProfile = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("admin-profile-page");
  const { width } = useWindowDimensions();

  const handleLogout = () => {
    adminSvc.logout();
    navigate("/");
  };

  return (
    <Page
      classes="page__admin-profile"
      heading={t("heading")}
      subheading={t("subheading")}
      showGoBackArrow={false}
      headingButton={
        <ButtonWithIcon
          label={t("button_label")}
          iconName="exit"
          iconColor="#ffffff"
          size="sm"
          circleSize="sm"
          onClick={handleLogout}
        />
      }
    >
      <AdminProfileBlock />
      {width < 768 && (
        <RadialCircle
          color="purple"
          classes="page__admin-profile__radial-circle"
        />
      )}
    </Page>
  );
};
