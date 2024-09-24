import React from "react";
import { useTranslation } from "react-i18next";

import { Page, Organizations as OrganizationsBlock } from "#blocks";

import "./organizations.scss";

/**
 * Organizations
 *
 * Page to display organizations
 *
 * @returns {JSX.Element}
 */
export const Organizations = () => {
  const { t } = useTranslation("organizations-page");
  return (
    <Page
      heading={t("heading")}
      showGoBackArrow={false}
      classes="page__organizations"
    >
      <OrganizationsBlock />
    </Page>
  );
};
