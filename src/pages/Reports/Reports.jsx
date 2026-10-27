import React from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Page,
  SecurityCheck,
  InformationPortalSuggestions,
  ClientRatings,
  ContactForms,
  OrganizationReports,
  MyQAReports,
  SosCenterClicks,
  ProvidersFreeSlots,
  ConsultationProblemReports as ConsultationProblemReportsBlock,
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

  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");

  const IS_RO = localStorage.getItem("country") === "RO";

  const localStorageCountry = localStorage.getItem("country");
  const tabOptions = [
    ...(IS_RO
      ? []
      : [
          {
            label: t("consultations_tab_label"),
            value: "consultations",
            isSelected: IS_RO ? false : true,
          },
        ]),
    {
      label: t("suggestions_tab_label"),
      value: "suggestions",
      isSelected: false,
    },
    {
      label: t("ratings_tab_label"),
      value: "ratings",
      isSelected: IS_RO ? true : false,
    },
    {
      label: t("contact_form_tab_label"),
      value: "contact_form",
      isSelected: false,
    },
    ...(IS_RO
      ? [
          {
            label: t("organization_reports_tab_label"),
            value: "organization_reports",
            isSelected: false,
          },
        ]
      : []),
    ...(IS_RO
      ? []
      : [
          {
            label: t("my_qa_tab_label"),
            value: "my_qa",
            isSelected: false,
          },
        ]),
    {
      label: t("sos_center_clicks_tab_label"),
      value: "sos_center_clicks",
      isSelected: false,
    },
    ...(localStorageCountry === "RO"
      ? []
      : [
          {
            label: t("providers_free_slots_tab_label"),
            value: "providers_free_slots",
            isSelected: false,
          },
        ]),
    {
      label: t("consultation_problems_tab_label"),
      value: "consultation_problems",
      isSelected: false,
    },
  ];
  const options = tabOptions.map((option) => ({
    ...option,
    isSelected: tabOptions.some((tab) => tab.value === requestedTab)
      ? option.value === requestedTab
      : option.isSelected,
  }));

  const handleTabSelect = (index) => {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      next.set("tab", options[index].value);
      return next;
    });
  };

  const renderBlock = () => {
    const selectedTab = options.find((x) => x.isSelected).value;
    switch (selectedTab) {
      case "consultation_problems":
        return <ConsultationProblemReportsBlock Heading={ReportBlockHeading} />;
      case "consultations":
        return <SecurityCheck Heading={ReportBlockHeading} />;
      case "suggestions":
        return <InformationPortalSuggestions Heading={ReportBlockHeading} />;
      case "ratings":
        return <ClientRatings Heading={ReportBlockHeading} />;
      case "contact_form":
        return <ContactForms Heading={ReportBlockHeading} />;
      case "organization_reports":
        return <OrganizationReports Heading={ReportBlockHeading} />;
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
