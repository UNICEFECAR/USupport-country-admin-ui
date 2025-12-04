import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Page,
  SecurityCheck,
  InformationPortalSuggestions,
  ClientRatings,
  ContactForms,
  MyQAReports,
  SosCenterClicks,
  ProvidersFreeSlots,
} from "#blocks";

import {
  TabsUnderlined,
  Block,
  ButtonWithIcon,
} from "@USupport-components-library/src";

import "./reports.scss";

/**
 * Reports
 *
 * Reports page
 *
 * @returns {JSX.Element}
 */
export const Reports = () => {
  const { t } = useTranslation("pages", { keyPrefix: "reports-page" });

  const IS_RO = localStorage.getItem("country") === "RO";

  const localStorageCountry = localStorage.getItem("country");
  const [options, setOptions] = useState([
    ...(IS_RO
      ? []
      : [
          {
            label: t("consultations"),
            value: "consultations",
            isSelected: IS_RO ? false : true,
          },
        ]),
    {
      label: t("suggestions"),
      value: "suggestions",
      isSelected: false,
    },
    { label: t("ratings"), value: "ratings", isSelected: IS_RO ? true : false },
    { label: t("contact_form"), value: "contact_form", isSelected: false },
    ...(IS_RO
      ? []
      : [
          {
            label: t("my_qa"),
            value: "my_qa",
            isSelected: false,
          },
        ]),
    {
      label: t("sos_center_clicks"),
      value: "sos_center_clicks",
      isSelected: false,
    },
    ...(localStorageCountry === "RO"
      ? []
      : [
          {
            label: t("providers_free_slots"),
            value: "providers_free_slots",
            isSelected: false,
          },
        ]),
  ]);

  const handleTabSelect = (index) => {
    const optionsCopy = [...options];

    optionsCopy.forEach((option) => {
      option.isSelected = false;
    });

    optionsCopy[index].isSelected = !optionsCopy[index].isSelected;

    setOptions(optionsCopy);
  };

  const renderBlock = () => {
    const selectedTab = options.find((x) => x.isSelected).value;
    switch (selectedTab) {
      case "consultations":
        return <SecurityCheck Heading={ReportBlockHeading} />;
      case "suggestions":
        return <InformationPortalSuggestions Heading={ReportBlockHeading} />;
      case "ratings":
        return <ClientRatings Heading={ReportBlockHeading} />;
      case "contact_form":
        return <ContactForms Heading={ReportBlockHeading} />;
      case "my_qa":
        return <MyQAReports Heading={ReportBlockHeading} />;
      case "sos_center_clicks":
        return <SosCenterClicks Heading={ReportBlockHeading} />;
      case "providers_free_slots":
        return <ProvidersFreeSlots />;
    }
  };

  const ReportBlockHeading = ({
    headingLabel,
    handleButtonClick,
    isButtonDisabled = false,
  }) => {
    return (
      <div className="page__reports__report-block-heading">
        <h4>{headingLabel}</h4>
        {handleButtonClick && (
          <ButtonWithIcon
            type="primary"
            label={t("filter")}
            iconName="filter"
            iconColor="#ffffff"
            iconSize="sm"
            color="purple"
            size="xs"
            onClick={handleButtonClick}
            disabled={isButtonDisabled}
          />
        )}
      </div>
    );
  };

  return (
    <Page
      classes="page__reports"
      showGoBackArrow={false}
      heading={t("heading")}
    >
      <Block>
        <TabsUnderlined
          options={options}
          handleSelect={handleTabSelect}
          t={t}
        />
      </Block>
      {renderBlock()}
    </Page>
  );
};
