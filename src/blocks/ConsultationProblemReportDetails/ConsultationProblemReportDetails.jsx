import React from "react";
import { useTranslation } from "react-i18next";
import {
  Block,
  Button,
  Grid,
  GridItem,
  Loading,
  ReportDetailCard,
} from "@USupport-components-library/src";

import "./consultation-problem-report-details.scss";

const formatDate = (value, timezone, locale) =>
  value
    ? new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: timezone || "UTC",
      }).format(new Date(value))
    : "—";

const display = (value, t) =>
  value === null || value === undefined || value === ""
    ? "—"
    : typeof value === "boolean"
    ? t(value ? "yes" : "no")
    : String(value);

const translated = (value, category, t) =>
  value ? t(`${category}.${value}`, { defaultValue: String(value) }) : "—";

const toFields = (rows, t) =>
  rows
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .map(([key, value]) => ({
      key,
      label: t(key),
      value: display(value, t),
      isIdentifier: key.endsWith("_id"),
    }));

/**
 * ConsultationProblemReportDetails
 *
 * Detail view for a single consultation problem report
 *
 * @return {jsx}
 */
export const ConsultationProblemReportDetails = ({
  report,
  isLoading,
  isError,
  onRetry,
  locale,
}) => {
  const { t, i18n } = useTranslation("pages", {
    keyPrefix: "consultation-problem-report-details-page",
  });
  const consultation = report?.consultation || {};
  const resolvedLocale = locale || i18n.resolvedLanguage;
  const date = (value) => formatDate(value, report?.timezone, resolvedLocale);
  const source = (value) => translated(value || "unknown", "sources", t);

  const overviewFields = report
    ? toFields(
        [
          ["report_id", report.reportId],
          ["submitted", date(report.submittedAt)],
          ["reporter", t(report.reporterType)],
          ["timezone", report.timezone || "UTC"],
          ["source", source(report.source)],
          ["device", t(report.deviceType || "unknown")],
        ],
        t
      )
    : [];

  const consultationFields = report
    ? toFields(
        [
          ["consultation_id", consultation.consultationId],
          ["status", translated(consultation.status, "states", t)],
          ["scheduled_start", date(consultation.time)],
          [
            "scheduled_end",
            consultation.time
              ? date(
                  new Date(
                    new Date(consultation.time).getTime() +
                      consultation.durationMinutes * 60000
                  )
                )
              : null,
          ],
          ["duration", consultation.durationMinutes],
          [
            "elapsed",
            consultation.time
              ? Math.round(
                  (new Date(report.submittedAt) -
                    new Date(consultation.time)) /
                    60000
                )
              : null,
          ],
        ],
        t
      )
    : [];

  const bookingFields = report
    ? toFields(
        [
          ["organization", report.organizationName],
          ["campaign", report.campaignName],
          ["sponsor", report.sponsorName],
          [
            "booking_source",
            consultation.bookedFrom
              ? translated(consultation.bookedFrom, "booking_sources", t)
              : null,
          ],
          [
            "created",
            consultation.createdAt ? date(consultation.createdAt) : null,
          ],
          [
            "updated",
            consultation.updatedAt ? date(consultation.updatedAt) : null,
          ],
          [
            "canceled_by",
            consultation.canceledBy
              ? t(consultation.canceledBy, {
                  defaultValue: consultation.canceledBy,
                })
              : null,
          ],
          [
            "canceled_at",
            consultation.canceledAt ? date(consultation.canceledAt) : null,
          ],
        ],
        t
      )
    : [];

  const technicalFields = report
    ? toFields(
        [
          [
            "browser",
            [report.browserName, report.browserVersion]
              .filter(Boolean)
              .join(" "),
          ],
          [
            "os",
            [report.osName, report.osVersion].filter(Boolean).join(" "),
          ],
          ...(report.appVersion ? [["app_version", report.appVersion]] : []),
          ["language", report.interfaceLanguage],
          ...(report.reporterTimezone &&
          report.reporterTimezone !== report.timezone
            ? [["reporter_timezone", report.reporterTimezone]]
            : []),
        ],
        t
      )
    : [];

  const contextFields = report
    ? toFields(
        Object.entries(report.callContext || {})
          .filter(
            ([, value]) =>
              value !== null && value !== undefined && value !== ""
          )
          .map(([key, value]) => [
            `context.${key}`,
            ["connectionState", "connectionQuality"].includes(key) && value
              ? translated(value, "states", t)
              : value,
          ]),
        t
      )
    : [];

  return (
    <Block classes="consultation-problem-report-details">
      <div
        className="consultation-problem-report-details__layout"
        dir={i18n.dir(resolvedLocale)}
      >
        {isLoading ? (
          <Loading />
        ) : isError ? (
          <div role="alert">
            <p className="text">{t("error")}</p>
            <Button label={t("retry")} size="sm" onClick={onRetry} />
          </div>
        ) : (
          <>
            <ReportDetailCard
              title={t("overview")}
              fields={overviewFields}
            />

            <ReportDetailCard
              title={t("consultation")}
              fields={consultationFields}
            />

            <ReportDetailCard
              title={t("participants")}
              note={t("current_data")}
            >
              <Grid classes="consultation-problem-report-details__participants">
                {[
                  { role: "client", name: report.clientName },
                  { role: "provider", name: report.providerName },
                ].map((person) => {
                  const personFields = toFields(
                    [
                      [
                        `${person.role}_id`,
                        consultation[`${person.role}DetailId`],
                      ],
                      [
                        `${person.role}_join`,
                        date(consultation[`${person.role}JoinTime`]),
                      ],
                      [
                        `${person.role}_leave`,
                        date(consultation[`${person.role}LeaveTime`]),
                      ],
                    ],
                    t
                  );
                  return (
                    <GridItem key={person.role} md={4} lg={6}>
                      <div className="consultation-problem-report-details__person">
                        <p className="small-text">
                          {t(person.role)}
                        </p>
                        <h4 className="consultation-problem-report-details__person-name">
                          {person.name || "—"}
                        </h4>
                        {personFields.map((field) => (
                          <p key={field.key} className="text">
                            {field.label}:{" "}
                            <strong
                              className={
                                field.isIdentifier
                                  ? "report-detail-card__identifier"
                                  : undefined
                              }
                            >
                              {field.value}
                            </strong>
                          </p>
                        ))}
                      </div>
                    </GridItem>
                  );
                })}
              </Grid>
            </ReportDetailCard>

            {bookingFields.length > 0 && (
              <ReportDetailCard
                title={t("booking")}
                fields={bookingFields}
              />
            )}

            <ReportDetailCard
              title={t("technical")}
              fields={[...technicalFields, ...contextFields]}
              note={t("quality_note")}
            />
          </>
        )}
      </div>
    </Block>
  );
};
