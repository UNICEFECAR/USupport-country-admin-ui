import React from "react";
import { useTranslation } from "react-i18next";

import { Modal, DropdownWithLabel } from "@USupport-components-library/src";

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
  handleResetFilters,
  handleApplyFilters,
  filters,
  setFilters,
  providerOptions,
  children,
}) => {
  const { t } = useTranslation("filter-questions");

  const applyFilters = () => {
    handleApplyFilters();
  };

  const resetFilters = () => {
    handleResetFilters();
  };

  return (
    <Modal
      isOpen={isOpen}
      heading={t("filters")}
      closeModal={handleClose}
      classes="filter-modal"
      ctaLabel={t("save")}
      ctaHandleClick={applyFilters}
      secondaryCtaLabel={t("reset")}
      secondaryCtaHandleClick={resetFilters}
      secondaryCtaType="secondary"
    >
      <div className="filter-modal__content-wrapper">
        {children}
        <DropdownWithLabel
          label={t("provider")}
          options={providerOptions}
          selected={filters.provider}
          setSelected={(value) =>
            setFilters((prev) => ({ ...prev, provider: value }))
          }
        />
      </div>
    </Modal>
  );
};
