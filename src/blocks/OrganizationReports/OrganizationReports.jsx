import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";

import {
  Block,
  Button,
  DateInput,
  Loading,
  ReportCollapsible,
  Modal,
  InputSearch,
} from "@USupport-components-library/src";

import {
  getDateView,
  getTimeFromDate,
} from "@USupport-components-library/utils";

import { useGetOrganizationReports, useCustomNavigate } from "#hooks";

import "./organization-reports.scss";

/**
 * OrganizationReports
 *
 * Organization reports list (Romania)
 *
 * @return {jsx}
 */
export const OrganizationReports = ({ Heading }) => {
  const { t } = useTranslation("blocks", { keyPrefix: "organization-reports" });
  const { isLoading, data } = useGetOrganizationReports();
  const navigate = useCustomNavigate();

  const goToOrganizationSearch = useCallback(
    (row) => {
      const searchText =
        (row.organizationName && row.organizationName.trim()) ||
        row.organizationId ||
        "";
      if (!searchText) return;
      const params = new URLSearchParams({ search: searchText });
      navigate(`/organizations?${params.toString()}`);
    },
    [navigate]
  );

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    startingDate: "",
    endingDate: "",
  });
  const [searchValue, setSearchValue] = useState("");

  const handleFilterSave = (filterData) => {
    setFilters(filterData);
  };

  const filterRows = (row) => {
    const isStartingDateMatching = filters.startingDate
      ? new Date(row.createdAt).getTime() >=
        new Date(new Date(filters.startingDate).setHours(0, 0, 0)).getTime()
      : true;

    const isEndDateMatching = filters.endingDate
      ? new Date(row.createdAt).getTime() <=
        new Date(new Date(filters.endingDate).setHours(23, 59, 59)).getTime()
      : true;

    const searchVal = searchValue.toLowerCase();
    const orgLabel = (row.organizationName || row.organizationId || "").toLowerCase();
    const isSearchMatching = !searchVal
      ? true
      : orgLabel.includes(searchVal) ||
        row.reason?.toLowerCase().includes(searchVal);

    return isStartingDateMatching &&
      isEndDateMatching &&
      isSearchMatching
      ? row
      : false;
  };

  const renderList = useMemo(() => {
    if (!data) return null;

    const filtered = data.filter(filterRows);
    if (filtered.length === 0) return <p>{t("no_results")}</p>;

    return filtered.map((row) => {
      const orgHeading =
        row.organizationName ||
        `${t("organization_id_prefix")} ${row.organizationId || "—"}`;
      return (
        <div
          key={row.organizationReportId}
          className="organization-reports__card"
          role="button"
          tabIndex={0}
          onClick={() => goToOrganizationSearch(row)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              goToOrganizationSearch(row);
            }
          }}
        >
          <ReportCollapsible
            canCollapse={false}
            headingItems={[
              <p key="org">
                {t("organization")}: <strong>{orgHeading}</strong>
              </p>,
              <p key="message">
                {t("content_heading")}:{" "}
                <strong>{row.reason?.trim() ? row.reason : "—"}</strong>
              </p>,
              <p key="time">
                {t("time")}:
                <strong>
                  {" "}
                  {getTimeFromDate(row.createdAt)}, {getDateView(row.createdAt)}
                </strong>
              </p>,
            ]}
            contentHeading=""
            contentText=""
          />
        </div>
      );
    });
  }, [data, filters, searchValue, goToOrganizationSearch, t]);

  return (
    <Block classes="organization-reports">
      <Heading
        headingLabel={t("heading")}
        handleButtonClick={() => setIsFilterOpen(true)}
      />
      <InputSearch
        placeholder={t("search")}
        value={searchValue}
        onChange={setSearchValue}
      />
      {isLoading ? <Loading /> : renderList}
      <Filters
        isOpen={isFilterOpen}
        handleClose={() => setIsFilterOpen(false)}
        handleSave={handleFilterSave}
        filters={filters}
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
    startingDate: filters.startingDate ?? "",
    endingDate: filters.endingDate ?? "",
  });

  const handleChange = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    handleSave(data);
    handleClose();
  };

  const handleResetFilters = () => {
    setData(initialFilters);
    handleSave(initialFilters);
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
            label={t("reset_filters")}
            size="lg"
            type="secondary"
            onClick={handleResetFilters}
          />
        </div>
      </>
    </Modal>
  );
};
