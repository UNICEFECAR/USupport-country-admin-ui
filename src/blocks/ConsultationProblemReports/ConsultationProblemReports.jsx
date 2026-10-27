import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Block,
  Button,
  DateInput,
  DropdownWithLabel,
  Loading,
  Modal,
  ReportCollapsible,
} from "@USupport-components-library/src";
import { useGetConsultationProblemReports, useCustomNavigate } from "#hooks";
import "./consultation-problem-reports.scss";

const initialFilters = { from: "", to: "", reporterType: "all", source: "all" };
const sourceKeys = ["web", "ios_app", "android_app", "unknown"];
const dateTime = (value, timezone, locale) =>
  value
    ? new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: timezone || "UTC",
      }).format(new Date(value))
    : "—";

const ReportContent = ({ reportId }) => {
  const { t } = useTranslation("blocks", {
    keyPrefix: "consultation-problem-reports",
  });
  const navigate = useCustomNavigate();
  return (
    <div className="consultation-problem-reports__content">
      <Button
        label={t("view_report")}
        size="sm"
        onClick={() => navigate(`/consultation-problem-reports/${reportId}`)}
      />
    </div>
  );
};

export const ConsultationProblemReports = ({ Heading }) => {
  const { t, i18n } = useTranslation("blocks", {
    keyPrefix: "consultation-problem-reports",
  });
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const query = useGetConsultationProblemReports({
    page,
    from: filters.from || undefined,
    to: filters.to || undefined,
    reporterType:
      filters.reporterType === "all" ? undefined : filters.reporterType,
    source: filters.source === "all" ? undefined : filters.source,
  });
  const applyFilters = (value) => {
    setFilters(value);
    setPage(1);
    setIsFilterOpen(false);
  };
  return (
    <Block classes="consultation-problem-reports">
      <Heading
        headingLabel={t("title")}
        handleButtonClick={() => setIsFilterOpen(true)}
      />
      {query.isLoading ? (
        <Loading />
      ) : query.isError ? (
        <div role="alert">
          <p>{t("error")}</p>
          <Button
            label={t("retry")}
            size="sm"
            onClick={() => query.refetch()}
          />
        </div>
      ) : (
        <>
          {!query.data.total && <p>{t("empty")}</p>}
          {query.data.reports.map((report) => (
            <ReportCollapsible
              key={report.reportId}
              headingItems={[
                <p key="submitted" className="text">
                  {t("submitted")}:{" "}
                  <strong>
                    {dateTime(
                      report.submittedAt,
                      query.data.timezone,
                      i18n.resolvedLanguage
                    )}
                  </strong>
                </p>,
                <p key="reporter" className="text">
                  {t("reporter")}:{" "}
                  <strong>
                    {t(report.reporterType)}
                    {report.reporterName ? ` — ${report.reporterName}` : ""}
                  </strong>
                </p>,
                <p key="source" className="text">
                  {t("source")}:{" "}
                  <strong>
                    {t(`sources.${report.source || "unknown"}`)} ·{" "}
                    {t(report.deviceType || "unknown")}
                  </strong>
                </p>,
              ]}
              headingText={`${t("consultation")}: ${dateTime(
                report.consultationTime,
                query.data.timezone,
                i18n.resolvedLanguage
              )}`}
              contentHeading={t("overview")}
            >
              <ReportContent reportId={report.reportId} />
            </ReportCollapsible>
          ))}
          {query.data.total > query.data.pageSize && (
            <div className="consultation-problem-reports__pagination">
              <Button
                label={t("previous")}
                size="sm"
                type="secondary"
                disabled={page === 1 || query.isFetching}
                onClick={() => setPage((value) => value - 1)}
              />
              <p className="text">
                {page} / {Math.ceil(query.data.total / query.data.pageSize)}
              </p>
              <Button
                label={t("next")}
                size="sm"
                type="secondary"
                disabled={
                  page * query.data.pageSize >= query.data.total ||
                  query.isFetching
                }
                onClick={() => setPage((value) => value + 1)}
              />
            </div>
          )}
        </>
      )}
      {isFilterOpen && (
        <ReportFilters
          filters={filters}
          onClose={() => setIsFilterOpen(false)}
          onSave={applyFilters}
        />
      )}
    </Block>
  );
};

const ReportFilters = ({ filters, onClose, onSave }) => {
  const { t } = useTranslation("blocks", {
    keyPrefix: "consultation-problem-reports",
  });
  const [data, setData] = useState(filters);
  const change = (key, value) =>
    setData((previous) => ({ ...previous, [key]: value }));
  return (
    <Modal
      isOpen
      closeModal={onClose}
      heading={t("filters")}
      classes="consultation-problem-reports__filters"
    >
      <DropdownWithLabel
        label={t("reporter")}
        selected={data.reporterType}
        setSelected={(value) => change("reporterType", value)}
        options={[
          { value: "all", label: t("all") },
          { value: "client", label: t("client") },
          { value: "provider", label: t("provider") },
        ]}
      />
      <DropdownWithLabel
        label={t("source")}
        selected={data.source}
        setSelected={(value) => change("source", value)}
        options={[
          { value: "all", label: t("all") },
          ...sourceKeys.map((value) => ({
            value,
            label: t(`sources.${value}`),
          })),
        ]}
      />
      <DateInput
        label={t("from")}
        value={data.from}
        onChange={(event) => change("from", event.target.value)}
      />
      <DateInput
        label={t("to")}
        value={data.to}
        onChange={(event) => change("to", event.target.value)}
      />
      <Button
        label={t("apply_filters")}
        size="lg"
        onClick={() => onSave(data)}
      />
      <Button
        label={t("reset_filters")}
        type="secondary"
        size="lg"
        onClick={() => onSave(initialFilters)}
      />
    </Modal>
  );
};
