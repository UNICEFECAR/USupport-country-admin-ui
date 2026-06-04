import React from "react";
import { useTranslation } from "react-i18next";
import { useCustomNavigate as useNavigate } from "#hooks";
import { Page, SecuritySettings as SecuritySettingsBlock } from "#blocks";

import "./security-settings-page.scss";

export const SecuritySettings = () => {
  const { t } = useTranslation("pages", { keyPrefix: "security-settings-page" });
  const navigate = useNavigate();

  const handleGoBack = () => navigate("/profile");

  return (
    <Page
      classes="page__security-settings"
      heading={t("heading")}
      handleGoBack={handleGoBack}
    >
      <SecuritySettingsBlock />
    </Page>
  );
};
