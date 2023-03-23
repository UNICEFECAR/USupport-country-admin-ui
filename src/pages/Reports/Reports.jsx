import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Page,
  SecurityCheck,
  InformationPortalSuggestions,
  ClientRatings,
  ContactForms,
} from "#blocks";

import {
  TabsUnderlined,
  Block,
  Button,
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
  const { t } = useTranslation("reports-page");

  const [options, setOptions] = useState([
    { label: t("consultations"), value: "consultations", isSelected: true },
    {
      label: t("suggestions"),
      value: "suggestions",
      isSelected: false,
    },
    { label: t("ratings"), value: "ratings", isSelected: false },
    { label: t("contact_form"), value: "contact_form", isSelected: false },
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
    }
  };

  const ReportBlockHeading = ({ headingLabel, handleButtonClick }) => {
    return (
      <div className="page__reports__report-block-heading">
        <h4>{headingLabel}</h4>
        <Button
          type="primary"
          label={t("filter")}
          color="purple"
          size="sm"
          onClick={handleButtonClick}
        />
      </div>
    );
  };

  return (
    <Page classes="page__reports" showGoBackArrow={false}>
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
