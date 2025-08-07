import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import {
  Modal,
  DropdownWithLabel,
  DateInput,
} from "@USupport-components-library/src";

import "./filter-questions.scss";

/**
 * FilterQuestions
 *
 * The FilterQuestions modal
 *
 * @return {jsx}
 */
export const FilterQuestions = ({
  isOpen,
  handleClose,
  tagsOptions,
  handleApplyFilters,
  handleResetFilters,
  providerOptions,
  reasonOptions,
  filters,
}) => {
  const { t } = useTranslation("modals", { keyPrefix: "filter-questions" });

  const [currFilter, setCurrFilter] = useState({
    reason: "",
    provider: "",
    startingDate: "",
    endingDate: "",
  });

  useEffect(() => {
    setCurrFilter(filters);
  }, [filters]);

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
      classes="filter-modal"
      ctaLabel={t("save")}
      ctaHandleClick={applyFilter}
      secondaryCtaLabel={t("reset")}
      secondaryCtaHandleClick={resetFilter}
      secondaryCtaType="secondary"
    >
      <div className="filter-modal__content-wrapper">
        {tagsOptions && (
          <DropdownWithLabel
            label={t("tag")}
            options={tagsOptions.flat().map((x) => {
              return { label: x, value: x, isSelected: currFilter.tag === x };
            })}
            selected={currFilter.tag}
            setSelected={(value) =>
              setCurrFilter((prev) => ({ ...prev, tag: value }))
            }
          />
        )}
        <DropdownWithLabel
          label={t("provider")}
          options={providerOptions}
          selected={currFilter.provider}
          setSelected={(value) =>
            setCurrFilter((prev) => ({ ...prev, provider: value }))
          }
        />
        {reasonOptions && (
          <DropdownWithLabel
            label={t("reason_dropdown_label")}
            options={reasonOptions.map((option) => {
              return {
                label: t(`${option.value}`),
                value: option.value,
                isSelected: currFilter.reason === option.value,
              };
            })}
            selected={currFilter.reason}
            setSelected={(value) =>
              setCurrFilter((prev) => ({ ...prev, reason: value }))
            }
          />
        )}
        <DateInput
          label={t("starting_date")}
          onChange={(e) => {
            setCurrFilter((prev) => ({
              ...prev,
              startingDate: e.target?.value,
            }));
          }}
          value={currFilter.startingDate || ""}
          placeholder={t("starting_date")}
          classes={["client-ratings__backdrop__date-picker"]}
        />
        <DateInput
          label={t("ending_date")}
          onChange={(e) => {
            setCurrFilter((prev) => ({
              ...prev,
              endingDate: e.target?.value,
            }));
          }}
          value={currFilter.endingDate || ""}
          placeholder={t("ending_date")}
          classes={["client-ratings__backdrop__date-picker"]}
        />
      </div>
    </Modal>
  );
};
