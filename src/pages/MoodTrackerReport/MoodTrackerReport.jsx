import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Block,
  Button,
  Emoticon,
  DateInput,
  Loading,
} from "@USupport-components-library/src";

import { Page } from "#blocks";
import { useGetMoodTrackerReport } from "#hooks";

import "./mood-tracker-report.scss";

const DEFAULT_FILTERS = {
  startDate: "",
  endDate: "",
};

/**
 * MoodTrackerReport
 *
 * Mood tracker reporting page
 *
 * @returns {JSX.Element}
 */
export const MoodTrackerReport = () => {
  const { t } = useTranslation("pages", {
    keyPrefix: "mood-tracker-report-page",
  });
  const { t: tBlocks } = useTranslation("blocks", {
    keyPrefix: "mood-tracker-report",
  });

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [errors, setErrors] = useState({});

  const IS_RO = localStorage.getItem("country") === "RO";

  const { data, isFetching } = useGetMoodTrackerReport({
    startDate: filters.startDate,
    endDate: filters.endDate,
  });

  const handleDateChange = (field) => (event) => {
    setFilters((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setErrors({});
  };

  const summaryItems = useMemo(() => {
    if (!data) {
      return [
        { label: tBlocks("total_entries"), value: 0 },
        { label: tBlocks("unique_clients"), value: 0 },
        ...(IS_RO ? [{ label: tBlocks("critical_entries"), value: 0 }] : []),
      ];
    }

    return [
      { label: tBlocks("total_entries"), value: data.totalCount ?? 0 },
      { label: tBlocks("unique_clients"), value: data.uniqueClients ?? 0 },
      ...(IS_RO
        ? [
            {
              label: tBlocks("critical_entries"),
              value: data.criticalCount ?? 0,
            },
          ]
        : []),
    ];
  }, [data, tBlocks]);

  const entries = useMemo(() => {
    if (!data?.moodBreakdown?.length) {
      return [];
    }

    return data.moodBreakdown
      .map((entry) => ({
        mood: entry.mood,
        count: entry.totalCount,
        uniqueClients: entry.uniqueClients,
        criticalCount: entry.criticalCount,
      }))
      .sort((x, y) => y.count - x.count);
  }, [data]);

  return (
    <Page
      showGoBackArrow={false}
      heading={t("heading")}
      classes="page__mood-tracker-report"
    >
      <Block classes="mood-tracker-report__filters">
        <p className="mood-tracker-report__description">{t("description")}</p>

        <div className="mood-tracker-report__filters__inputs">
          <DateInput
            placeholder={tBlocks("select_start_date")}
            label={tBlocks("start_date")}
            value={filters.startDate}
            onChange={handleDateChange("startDate")}
            errorMessage={errors.startDate}
          />
          <DateInput
            placeholder={tBlocks("select_end_date")}
            label={tBlocks("end_date")}
            value={filters.endDate}
            onChange={handleDateChange("endDate")}
            errorMessage={errors.endDate}
          />
        </div>

        <Button
          classes="mood-tracker-report__filters__reset-button"
          color="purple"
          size="md"
          onClick={handleResetFilters}
          disabled={!filters.startDate && !filters.endDate}
        >
          {tBlocks("reset_filters")}
        </Button>
      </Block>

      {/* Analysis Content Container - matching BaselineAssessmentThresholds design */}
      <Block classes="mood-tracker-report__analysis">
        {isFetching ? (
          <div className="mood-tracker-report__analysis-loading">
            <Loading size="md" />
          </div>
        ) : (
          <div className="mood-tracker-report__analysis-content">
            {/* Summary Section */}
            <div className="mood-tracker-report__summary">
              <div className="mood-tracker-report__summary-list">
                {summaryItems.map((item) => (
                  <div
                    key={item.label}
                    className="mood-tracker-report__summary-card"
                  >
                    <p className="mood-tracker-report__summary-card-label">
                      {item.label}
                    </p>
                    <p className="mood-tracker-report__summary-card-value">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Mood Breakdown Section */}
            {entries.length === 0 ? (
              <div className="mood-tracker-report__no-data">
                <p>{tBlocks("no_data")}</p>
              </div>
            ) : (
              <div className="mood-tracker-report__list">
                <div className="mood-tracker-report__list-items">
                  {entries.map((row) => (
                    <div
                      key={row.mood || "unknown"}
                      className="mood-tracker-report__list-item"
                    >
                      <div>
                        <Emoticon name={`emoticon-${row.mood}`} size="md" />
                        <p className="mood-tracker-report__list-item-mood">
                          {tBlocks(row.mood) || "-"}
                        </p>
                      </div>
                      <div className="mood-tracker-report__list-item-data">
                        <div className="mood-tracker-report__list-item-meta">
                          <p className="mood-tracker-report__meta-label">
                            {tBlocks("count")}:
                          </p>
                          <p className="mood-tracker-report__meta-value">
                            {row.count}
                          </p>
                        </div>
                        <div className="mood-tracker-report__list-item-meta">
                          <span className="mood-tracker-report__meta-label">
                            {tBlocks("unique_clients")}:
                          </span>
                          <span className="mood-tracker-report__meta-value">
                            {row.uniqueClients}
                          </span>
                        </div>
                        {IS_RO && (
                          <div className="mood-tracker-report__list-item-meta">
                            <span className="mood-tracker-report__meta-label">
                              {tBlocks("critical_count")}:
                            </span>
                            <span className="mood-tracker-report__meta-value">
                              {row.criticalCount}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Block>
    </Page>
  );
};

export default MoodTrackerReport;
