import React from "react";
import { useTranslation } from "react-i18next";

import { Page, Campaigns as CampaignsBlock } from "#blocks";

import "./campaigns.scss";

/**
 * Campaigns
 *
 * Campaigns page
 *
 * @returns {JSX.Element}
 */
export const Campaigns = () => {
  const { t } = useTranslation("campaigns-page");
  return (
    <Page classes="page__campaigns" heading={t("heading")}>
      <CampaignsBlock />
    </Page>
  );
};
