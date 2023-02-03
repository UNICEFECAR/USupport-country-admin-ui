import React from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Page, AddSponsor as AddSponsorBlock } from "#blocks";

import "./edit-sponsor.scss";

/**
 * EditSponsor
 *
 * Edit sponsor page
 *
 * @returns {JSX.Element}
 */
export const EditSponsor = () => {
  const { t } = useTranslation("edit-sponsor");

  const sponsorId = new URLSearchParams(window.location.search).get(
    "sponsorId"
  );

  if (!sponsorId) return <Navigate to="/campaigns" />;

  return (
    <Page heading={t("heading")} classes="page__edit-sponsor">
      <AddSponsorBlock sponsorId={sponsorId} />
    </Page>
  );
};
