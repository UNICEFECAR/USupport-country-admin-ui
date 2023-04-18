import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import {
  Modal,
  DropdownWithLabel,
  Loading,
  Input,
  Button,
} from "@USupport-components-library/src";

import { useGetProvidersData } from "#hooks";

import "./filter-security-check-reports.scss";

/**
 * FilterSecurityCheckReports
 *
 * The FilterSecurityCheckReports backdrop
 *
 * @return {jsx}
 */
export const FilterSecurityCheckReports = ({
  isOpen,
  onClose,
  changeFilter,
}) => {
  const { t } = useTranslation("filter-security-check-reports");
  const [providersDataQuery] = useGetProvidersData();
  const { isLoading, data } = providersDataQuery;

  const initialFiltersData = {
    provider: null,
    numberOfIssues: 0,
    startingDate: null,
  };
  const [filtersData, setFiltersData] = useState({ ...initialFiltersData });
  const [providerOptions, setProviderOptions] = useState([]);

  useEffect(() => {
    if (data) {
      const options = [{ label: t("all"), value: null }];
      data.forEach((provider) => {
        options.push({
          value: provider.providerDetailId,
          label: `${provider.name} ${provider.patronym} ${provider.surname}`,
          isSelected: false,
        });
      });
      setProviderOptions(options);
    }
  }, [data]);

  const handleChange = (field, value) => {
    const dataCopy = { ...filtersData };
    dataCopy[field] = value;
    setFiltersData(dataCopy);
  };

  const handleSubmit = () => {
    changeFilter(filtersData);
    onClose();
  };

  const handleResetFilters = () => {
    changeFilter(initialFiltersData);
    onClose();
  };

  return (
    <Modal
      classes="filter-security-check-reports"
      heading={t("heading")}
      isOpen={isOpen}
      closeModal={onClose}
    >
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <div>
            <DropdownWithLabel
              options={providerOptions}
              label={t("provider")}
              selected={filtersData.provider}
              setSelected={(value) => handleChange("provider", value)}
            />

            <DropdownWithLabel
              label={t("number_of_issues")}
              placeholder="0"
              options={[
                { value: 0, label: "0" },
                { value: 1, label: "1" },
                { value: 2, label: "2" },
                { value: 3, label: "3" },
                { value: 4, label: "4" },
              ]}
              selected={filtersData.numberOfIssues}
              setSelected={(value) => handleChange("numberOfIssues", value)}
            />
            <Input
              type="date"
              label={t("starting_date")}
              onChange={(e) => handleChange("startingDate", e.target.value)}
              value={filtersData.startingDate}
              placeholder="DD.MM.YYY"
              classes="filter-security-check-reports__date-picker"
            />
          </div>

          <Button
            label={t("button_label")}
            size="lg"
            onClick={handleSubmit}
            classes="filter-security-check-reports__submit-button"
          />
          <Button
            label={t("reset_filter")}
            type="secondary"
            size="lg"
            onClick={handleResetFilters}
            classes="filter-security-check-reports__reset-button"
          />
        </>
      )}
    </Modal>
  );
};
