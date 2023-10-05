import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { Page, Providers as ProvidersBlock } from "#blocks";
import { Icon, Button } from "@USupport-components-library/src";
import { useWindowDimensions } from "@USupport-components-library/utils";

import "./providers.scss";

/**
 * Providers
 *
 * Display all the providers
 *
 * @returns {JSX.Element}
 */
export const Providers = () => {
  const { t } = useTranslation("providers-page");
  const navigate = useNavigate();
  const { width } = useWindowDimensions();

  const [displayListView, setDisplayListView] = useState(true);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const headingButton = (
    <div className="page__providers__button-container">
      <Icon
        color="#20809E"
        name={displayListView ? "grid-view" : "list-view"}
        size={width >= 768 ? "lg" : "md"}
        onClick={() => setDisplayListView(!displayListView)}
      />
      <Button
        label={t("create_provider")}
        classes="providers__create-provider-button"
        onClick={() => navigate("/create-provider")}
        size={width >= 360 ? "sm" : "xs"}
      />
      <Button
        label={t("filter_providers")}
        onClick={() => setIsFilterModalOpen(true)}
        size={width >= 360 ? "sm" : "xs"}
        color="purple"
      />
    </div>
  );

  return (
    <Page
      showGoBackArrow={false}
      classes="page__providers"
      headingButton={headingButton}
      heading={t("heading")}
    >
      <ProvidersBlock
        displayListView={displayListView}
        isFilterModalOpen={isFilterModalOpen}
        setIsFilterModalOpen={setIsFilterModalOpen}
      />
    </Page>
  );
};
