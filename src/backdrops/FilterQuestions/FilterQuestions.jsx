import React, { useState, useEffect } from "react";
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
  tagsOptions,
  filters,
  setFilters,
  providerOptions,
}) => {
  const { t } = useTranslation("filter-questions");

  const [currFilter, setCurrFilter] = useState({});

  useEffect(() => {
    if (filters.provider || filters.tag) {
      setCurrFilter(filters);
    }
  }, []);

  const handleApplyFilter = () => {
    setFilters(currFilter);
    handleClose();
  };

  const hanleResetFilter = () => {
    setFilters({ provider: null, tag: null });
    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      heading={t("filters")}
      closeModal={handleClose}
      classes="filter-modal"
      ctaLabel={t("save")}
      ctaHandleClick={handleApplyFilter}
      secondaryCtaLabel={t("reset")}
      secondaryCtaHandleClick={hanleResetFilter}
      secondaryCtaType="secondary"
    >
      <div className="filter-modal__content-wrapper">
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
        <DropdownWithLabel
          label={t("provider")}
          options={providerOptions}
          selected={currFilter.provider}
          setSelected={(value) =>
            setCurrFilter((prev) => ({ ...prev, provider: value }))
          }
        />
      </div>
    </Modal>
  );
};
