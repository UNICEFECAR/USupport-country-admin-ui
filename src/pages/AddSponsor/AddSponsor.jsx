import React from "react";
import { Page, AddSponsor as AddSponsorBlock } from "#blocks";
import { useTranslation } from "react-i18next";

import "./add-sponsor.scss";

/**
 * AddSponsor
 *
 * Add sponsor page
 *
 * @returns {JSX.Element}
 */
export const AddSponsor = () => {
  const { t } = useTranslation("add-sponsor-page");
  return (
    <Page heading={t("heading")} classes="page__add-sponsor">
      <AddSponsorBlock />
    </Page>
  );
};
