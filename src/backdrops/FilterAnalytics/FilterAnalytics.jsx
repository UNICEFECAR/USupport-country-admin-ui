import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

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
  const country = localStorage.getItem("country");
  const IS_PL = country === "PL";

  const [currFilter, setCurrFilter] = useState({
    startDate: "",
    endDate: "",
    sex: "",
    urbanRural: "",
    yearOfBirth: "",
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

  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 100; year <= currentYear - 10; year++) {
      years.push({ label: year.toString(), value: year.toString() });
    }
    if (!IS_PL) {
      years.push({ label: t("parent"), value: "parent" });
    }
    years.push({ label: t("all"), value: "" });
    return years.reverse();
  };

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
          label={t("year_of_birth_label")}
          options={getYearOptions()}
          selected={currFilter.yearOfBirth}
          setSelected={(value) =>
            setCurrFilter((prev) => ({ ...prev, yearOfBirth: value }))
          }
          placeholder={t("year_of_birth_placeholder")}
        />
      </div>
    </Modal>
  );
};
