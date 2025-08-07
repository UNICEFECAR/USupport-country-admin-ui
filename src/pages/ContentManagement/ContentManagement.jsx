import { useTranslation } from "react-i18next";
import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Page, Articles, SOSCenter, Videos, Podcasts, FAQ } from "#blocks";
import { Block, Tabs, Grid, GridItem } from "@USupport-components-library/src";

import "./content-management.scss";

/**
 * ContentManagement
 *
 * Page to manage all Information portal content
 *
 * @returns {JSX.Element}
 */
export const ContentManagement = () => {
  const { t, i18n } = useTranslation("pages", {
    keyPrefix: "content-management-page",
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab");

  const [contentTabs, setContentTabs] = useState([
    { label: "faqs", value: "faqs", isSelected: tab === "faqs" },
    {
      label: "sos_centers",
      value: "sos_centers",
      isSelected: tab === "sos_centers",
    },
    { label: "articles", value: "articles", isSelected: tab === "articles" },
    { label: "videos", value: "videos", isSelected: tab === "videos" },
    { label: "podcasts", value: "podcasts", isSelected: tab === "podcasts" },
  ]);

  const handleTabSelect = (index) => {
    const tabsCopy = [...contentTabs];
    tabsCopy.forEach((tab, i) => {
      tab.isSelected = i === index;
    });
    setContentTabs(tabsCopy);
    setSearchParams({ tab: contentTabs[index].value });
  };

  const renderContentBlock = () => {
    const selectedTab = contentTabs.find((tab) => tab.isSelected);

    switch (selectedTab.value) {
      case "articles":
        return <Articles />;
      case "videos":
        return <Videos t={t} i18n={i18n} />;
      case "podcasts":
        return <Podcasts t={t} i18n={i18n} />;
      case "sos_centers":
        return <SOSCenter />;
      case "faqs":
        return <FAQ />;
      default:
        return <Articles />;
    }
  };

  return (
    <Page
      heading={t("title")}
      showGoBackArrow={false}
      classes="page__content-management"
    >
      <Block classes="page__content-management">
        <Grid classes="page__content-management__grid">
          <GridItem
            md={8}
            lg={12}
            classes="page__content-management__tabs-container"
          >
            <Tabs
              numberOfOptionsToRender={5}
              options={contentTabs.map((x) => ({
                ...x,
                label: t(x.label),
              }))}
              handleSelect={handleTabSelect}
              classes="page__content-management__tabs"
              t={t}
            />
          </GridItem>

          <GridItem md={8} lg={12} classes="page__content-management__content">
            {renderContentBlock()}
          </GridItem>
        </Grid>
      </Block>
    </Page>
  );
};
