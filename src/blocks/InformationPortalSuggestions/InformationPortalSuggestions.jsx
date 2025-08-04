import React, { useState, useMemo } from "react";
import {
  Block,
  Button,
  DateInput,
  Loading,
  Modal,
  ReportCollapsible,
  InputSearch,
  DropdownWithLabel,
} from "@USupport-components-library/src";

import {
  getTimeFromDate,
  getDateView,
} from "@USupport-components-library/utils";
import { useTranslation } from "react-i18next";

import { useGetPlatformSuggestions } from "#hooks";

import "./information-portal-suggestions.scss";

/**
 * InformationPortalSuggestions
 *
 * Information portal suggestions block
 *
 * @return {jsx}
 */
export const InformationPortalSuggestions = ({ Heading }) => {
  const { t, i18n } = useTranslation("blocks", {
    keyPrefix: "information-portal-suggestions",
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    type: "all",
  });
  const [searchValue, setSearchValue] = useState("");

  const { isLoading, data } = useGetPlatformSuggestions("all");

  const handleFilterSave = (filterData) => {
    setFilters(filterData);
  };

  const filterSuggestions = (suggestion) => {
    const isStartingDateMatching = filters.startingDate
      ? new Date(suggestion.createdAt).getTime() >=
        new Date(new Date(filters.startingDate).setHours(0, 0, 0)).getTime()
      : true;

    const isStartDateMatching = filters.endingDate
      ? new Date(suggestion.createdAt).getTime() <=
        new Date(new Date(filters.endingDate).setHours(23, 59, 59)).getTime()
      : true;

    const search = searchValue.toLowerCase();
    const isSearchValueMatching = !searchValue
      ? true
      : suggestion.clientEmail?.toLowerCase().includes(search) ||
        suggestion.clientName?.toLowerCase().includes(search) ||
        suggestion.clientNickname?.toLowerCase().includes(search) ||
        suggestion.suggestion?.toLowerCase().includes(search);

    const isTypeMatching =
      filters.type === "all" ? true : suggestion.type === filters.type;

    return isStartingDateMatching &&
      isSearchValueMatching &&
      isStartDateMatching &&
      isTypeMatching
      ? suggestion
      : false;
  };

  const renderSuggestions = useMemo(() => {
    if (!data) return null;

    const filteredSuggestions = data.filter(filterSuggestions);
    if (filteredSuggestions.length === 0) return <p>{t("no_results")}</p>;

    return filteredSuggestions
      .sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      })
      .map((suggestion, index) => {
        return (
          <ReportCollapsible
            key={index}
            headingItems={[
              <p>
                {t("type")}: {t(suggestion.type.replace("-", "_"))}
              </p>,
              <p>
                {t(
                  suggestion.clientEmail
                    ? "email"
                    : suggestion.clientName
                    ? "name"
                    : "nickname"
                )}
                :{" "}
                <span>
                  {suggestion.clientEmail ||
                    suggestion.clientName ||
                    suggestion.clientNickname}
                </span>
              </p>,

              <p>
                {t("time")}:
                <strong>
                  {" "}
                  {getTimeFromDate(suggestion.createdAt)},{" "}
                  {getDateView(suggestion.createdAt)}
                </strong>
              </p>,
            ]}
            contentHeading={t("content_heading")}
            contentText={suggestion.suggestion}
          />
        );
      });
  }, [data, filters, searchValue, i18n.language]);

  return (
    <Block classes="information-portal-suggestions">
      <Heading
        headingLabel={`${t("heading")} - ${t(filters.type?.replace("-", "_"))}`}
        handleButtonClick={() => setIsFilterOpen(true)}
      />
      <div className="information-portal-suggestions__controls">
        <InputSearch
          placeholder={t("search")}
          value={searchValue}
          onChange={setSearchValue}
        />
      </div>
      {isLoading ? <Loading /> : renderSuggestions}
      <Filters
        filters={filters}
        isOpen={isFilterOpen}
        handleClose={() => setIsFilterOpen(false)}
        handleSave={handleFilterSave}
        t={t}
      />
    </Block>
  );
};

const Filters = ({ isOpen, handleClose, handleSave, filters, t }) => {
  const initialFilters = {
    startingDate: "",
    endingDate: "",
  };
  const [data, setData] = useState({
    startingDate: filters.startingDate,
    endingDate: filters.endingDate,
    type: "all",
  });

  const suggestionTypeOptions = [
    { label: t("all"), value: "all" },
    { label: t("information_portal"), value: "information-portal" },
    { label: t("my_qa"), value: "my-qa" },
    { label: t("consultations"), value: "consultations" },
    { label: t("organizations"), value: "organizations" },
    { label: t("mood_tracker"), value: "mood-tracker" },
  ];

  const handleChange = (field, value) => {
    setData({
      ...data,
      [field]: value,
    });
  };

  const handleSubmit = () => {
    handleSave(data);
    handleClose();
  };

  const handleResetFilters = () => {
    setData(initialFilters);
    handleSave(initialFilters);
  };

  return (
    <Modal
      isOpen={isOpen}
      heading={t("filters")}
      closeModal={handleClose}
      classes="client-ratings__backdrop"
    >
      <>
        <div>
          <DropdownWithLabel
            options={suggestionTypeOptions}
            selected={data.type}
            setSelected={(val) => handleChange("type", val)}
            label={t("suggestion_type")}
            placeholder={t("select_type")}
            classes="information-portal-suggestions__type-dropdown"
          />
          <DateInput
            label={t("starting_date")}
            onChange={(e) => handleChange("startingDate", e.target.value)}
            value={data.startingDate}
            placeholder={t("starting_date")}
            classes={["client-ratings__backdrop__date-picker"]}
          />
          <DateInput
            label={t("ending_date")}
            onChange={(e) => handleChange("endingDate", e.target.value)}
            value={data.endingDate}
            placeholder={t("ending_date")}
            classes={["client-ratings__backdrop__date-picker"]}
          />
        </div>
        <div className="client-ratings__backdrop__buttons-container">
          <Button label={t("submit")} size="lg" onClick={handleSubmit} />
          <Button
            label={t("reset")}
            size="lg"
            type="secondary"
            onClick={handleResetFilters}
          />
        </div>
      </>
    </Modal>
  );
};
