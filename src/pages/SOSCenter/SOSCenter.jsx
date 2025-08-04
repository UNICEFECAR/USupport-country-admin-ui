import React from "react";
import { Page, SOSCenter as SOSCenterBlock } from "#blocks";
import { useTranslation } from "react-i18next";

/**
 * SOSCenter
 *
 * SOSCenter Page
 *
 * @returns {JSX.Element}
 */
export const SOSCenter = () => {
  const { t } = useTranslation("pages", { keyPrefix: "sos-center-page" });
  return (
    <Page
      classes="page__soscenter"
      heading={t("heading")}
      showGoBackArrow={false}
    >
      <SOSCenterBlock />
    </Page>
  );
};
