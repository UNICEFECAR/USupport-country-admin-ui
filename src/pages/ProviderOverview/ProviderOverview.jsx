import React from "react";
import { useTranslation } from "react-i18next";
import { Page, ProviderOverview as ProviderOverviewBlock } from "#blocks";
import { useWindowDimensions } from "@USupport-components-library/src/utils";
import { RadialCircle, Button } from "@USupport-components-library/src";

import "./provider-overview.scss";

/**
 * ProviderOverview
 *
 * ProviderOverview page
 *
 * @returns {JSX.Element}
 */
export const ProviderOverview = () => {
  const { t } = useTranslation("provider-overview-page");

  const { width } = useWindowDimensions();

  return (
    <Page classes="page__provider-overview" heading={t("heading")}>
      <ProviderOverviewBlock />
      <div className="page__provider-overview__button-container">
        <Button
          label={t("button_label")}
          color="purple"
          size="md"
          onClick={() => handleSchedule()}
        />
      </div>
      {width < 768 && <RadialCircle />}
    </Page>
  );
};
