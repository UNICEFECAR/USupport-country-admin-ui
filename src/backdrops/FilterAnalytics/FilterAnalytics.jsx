import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";

import {
  Modal,
  DropdownWithLabel,
  DateInput,
} from "@USupport-components-library/src";

import "./filter-analytics.scss";

/**
 * FilterAnalytics
 *
 * The FilterAnalytics modal
 *
 * @return {jsx}
 */
export const FilterAnalytics = ({
  isOpen,
  handleClose,
  filters,
  handleApplyFilters,
  handleResetFilters,
}) => {
  const { t } = useTranslation("blocks", { keyPrefix: "analytics" });
  const queryClient = useQueryClient();
  const countriesData = queryClient.getQueryData(["countries"]);
  const country = localStorage.getItem("country");
  const selectedCountry = countriesData?.find((c) => c.value === country);
  const minAge = selectedCountry?.minAge;
  const maxAge = selectedCountry?.maxAge;
  const IS_PL = country === "PL";

  const [currFilter, setCurrFilter] = useState({
    startDate: "",
    endDate: "",
    sex: "",
    urbanRural: "",
    yearOfBirthFrom: "",
    yearOfBirthTo: "",
  });

  useEffect(() => {
    setCurrFilter(filters);
  }, [filters]);

  const sexOptions = [
    { label: t("all"), value: "" },
    { label: t("sex_male"), value: "male" },
    { label: t("sex_female"), value: "female" },
    { label: t("sex_unspecified"), value: "unspecified" },
  ];

  const urbanRuralOptions = [
    { label: t("all"), value: "" },
    { label: t("place_of_living_urban"), value: "urban" },
    { label: t("place_of_living_rural"), value: "rural" },
  ];

  const getYearsOptions = useCallback(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (
      let year = currentYear - maxAge;
      year <= currentYear - minAge;
      year++
    ) {
      years.push({ label: year.toString(), value: year.toString() });
    }
    // Only add parent option if country is not PL
    // if (country !== "PL") {
    //   years.push({
    //     label: t("parent"),
    //     value: "parent",
    //   });
    // }
    return years.reverse();
  }, [countriesData, country, maxAge, minAge]);

  const getYearOfBirthFromOptions = useCallback(() => {
    const allYears = getYearsOptions();
    if (!currFilter.yearOfBirthTo) {
      return allYears;
    }
    const endYear = parseInt(currFilter.yearOfBirthTo);
    return allYears.filter(
      (year) => !year.value || parseInt(year.value) < endYear
    );
  }, [getYearsOptions, currFilter.yearOfBirthTo]);

  const getYearOfBirthToOptions = useCallback(() => {
    const allYears = getYearsOptions();
    if (!currFilter.yearOfBirthFrom) {
      return allYears;
    }
    const startYear = parseInt(currFilter.yearOfBirthFrom);
    return allYears.filter(
      (year) => !year.value || parseInt(year.value) > startYear
    );
  }, [getYearsOptions, currFilter.yearOfBirthFrom]);

  const applyFilter = () => {
    handleApplyFilters(currFilter);
    handleClose();
  };

  const resetFilter = () => {
    handleResetFilters();
    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      heading={t("filters")}
      closeModal={handleClose}
      classes="filter-analytics-modal"
      ctaLabel={t("apply_filters")}
      ctaHandleClick={applyFilter}
      secondaryCtaLabel={t("reset")}
      secondaryCtaHandleClick={resetFilter}
      secondaryCtaType="secondary"
    >
      <div className="filter-analytics-modal__content-wrapper">
        <DateInput
          label={t("start_date")}
          value={currFilter.startDate}
          onChange={(e) =>
            setCurrFilter((prev) => ({ ...prev, startDate: e.target.value }))
          }
          placeholder={t("select_start_date")}
          classes={["filter-analytics-modal__date-input"]}
        />
        <DateInput
          label={t("end_date")}
          value={currFilter.endDate}
          onChange={(e) =>
            setCurrFilter((prev) => ({ ...prev, endDate: e.target.value }))
          }
          placeholder={t("select_end_date")}
          classes={["filter-analytics-modal__date-input"]}
        />
        <DropdownWithLabel
          classes="filter-analytics-modal__dropdown"
          label={t("sex_label")}
          options={sexOptions}
          selected={currFilter.sex}
          setSelected={(value) =>
            setCurrFilter((prev) => ({ ...prev, sex: value }))
          }
          placeholder={t("sex_placeholder")}
        />
        <DropdownWithLabel
          classes="filter-analytics-modal__dropdown"
          label={t("place_of_living_label")}
          options={urbanRuralOptions}
          selected={currFilter.urbanRural}
          setSelected={(value) =>
            setCurrFilter((prev) => ({ ...prev, urbanRural: value }))
          }
          placeholder={t("place_of_living_placeholder")}
        />
        <DropdownWithLabel
          classes="filter-analytics-modal__dropdown"
          label={t("year_of_birth_from_label")}
          options={getYearOfBirthFromOptions()}
          selected={currFilter.yearOfBirthFrom}
          setSelected={(value) => {
            setCurrFilter((prev) => {
              const updated = { ...prev, yearOfBirthFrom: value };
              // If the selected start year is >= end year, clear end year
              if (
                updated.yearOfBirthTo &&
                value &&
                parseInt(value) >= parseInt(updated.yearOfBirthTo)
              ) {
                updated.yearOfBirthTo = "";
              }
              return updated;
            });
          }}
          placeholder={t("year_of_birth_from_placeholder")}
        />
        <DropdownWithLabel
          classes="filter-analytics-modal__dropdown"
          label={t("year_of_birth_to_label")}
          options={getYearOfBirthToOptions()}
          selected={currFilter.yearOfBirthTo}
          setSelected={(value) => {
            setCurrFilter((prev) => {
              const updated = { ...prev, yearOfBirthTo: value };
              // If the selected end year is <= start year, clear start year
              if (
                updated.yearOfBirthFrom &&
                value &&
                parseInt(value) <= parseInt(updated.yearOfBirthFrom)
              ) {
                updated.yearOfBirthFrom = "";
              }
              return updated;
            });
          }}
          placeholder={t("year_of_birth_to_placeholder")}
        />
      </div>
    </Modal>
  );
};
