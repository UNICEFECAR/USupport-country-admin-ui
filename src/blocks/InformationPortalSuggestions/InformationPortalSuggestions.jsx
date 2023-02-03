import React, { useState, useMemo } from "react";
import {
  Block,
  Button,
  Input,
  Loading,
  Modal,
  ReportCollapsible,
} from "@USupport-components-library/src";

import {
  getTimeFromDate,
  getDateView,
} from "@USupport-components-library/utils";
import { useTranslation } from "react-i18next";

import { useGetInformationPortalSuggestions } from "#hooks";

import "./information-portal-suggestions.scss";

/**
 * InformationPortalSuggestions
 *
 * Information portal suggestions block
 *
 * @return {jsx}
 */
export const InformationPortalSuggestions = ({ Heading }) => {
  const { t } = useTranslation("information-portal-suggestions");
  const { isLoading, data } = useGetInformationPortalSuggestions();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({});

  const handleFilterSave = (filterData) => {
    setFilters(filterData);
  };

  const filterSuggestions = (suggestion) => {
    const isStartingDateMatching = filters.startingDate
      ? new Date(suggestion.createdAt).toLocaleDateString() >=
        new Date(filters.startingDate).toLocaleDateString()
      : true;

    return isStartingDateMatching ? suggestion : false;
  };

  const renderSuggestions = useMemo(() => {
    if (!data) return null;

    const filteredSuggestions = data.filter(filterSuggestions);
    if (filteredSuggestions.length === 0) return <p>{t("no_results")}</p>;

    return filteredSuggestions.map((suggestion, index) => {
      return (
        <ReportCollapsible
          key={index}
          headingItems={[
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
  }, [data, filters]);

  return (
    <Block classes="information-portal-suggestions">
      <Heading
        headingLabel={t("heading")}
        handleButtonClick={() => setIsFilterOpen(true)}
      />
      {isLoading ? <Loading /> : renderSuggestions}
      <Filters
        isOpen={isFilterOpen}
        handleClose={() => setIsFilterOpen(false)}
        handleSave={handleFilterSave}
        t={t}
      />
    </Block>
  );
};

const Filters = ({ isOpen, handleClose, handleSave, t }) => {
  const [data, setData] = useState({
    startingDate: "",
  });

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

  return (
    <Modal
      isOpen={isOpen}
      heading={t("filters")}
      closeModal={handleClose}
      classes="client-ratings__backdrop"
    >
      <>
        <div>
          <Input
            type="date"
            label={t("starting_date")}
            onChange={(e) =>
              handleChange("startingDate", e.currentTarget.value)
            }
            value={data.startingDate}
            placeholder="DD.MM.YYY"
            classes="client-ratings__backdrop__date-picker"
          />
        </div>
        <Button label={t("submit")} size="lg" onClick={handleSubmit} />
      </>
    </Modal>
  );
};
