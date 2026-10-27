import React from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Page } from "#blocks";
import {
  Block,
  Button,
  Grid,
  GridItem,
  Loading,
  ReportCollapsible,
} from "@USupport-components-library/src";
import { useGetConsultationProblemReport, useCustomNavigate } from "#hooks";
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

const Fields = ({ rows, columns = false }) => {
  const { t } = useTranslation("pages", {
    keyPrefix: "consultation-problem-report-details-page",
  });
  return (
    <Grid classes="problem-report-fields">
      {rows.map(([key, value]) => (
        <GridItem
          key={key}
          md={columns ? 4 : 8}
          lg={columns ? 6 : 12}
          classes="problem-report-field"
        >
          <p className="text">
            <strong>{t(key)}</strong>
          </p>
          <p
            className={`text${
              key.endsWith("_id") ? " problem-report-identifier" : ""
            }`}
          >
            {display(value, t)}
          </p>
        </GridItem>
      ))}
    </Grid>
  );
};

export const ConsultationProblemReportDetails = () => {
  const { reportId, language } = useParams();
  const navigate = useCustomNavigate();
  const query = useGetConsultationProblemReport(reportId);
  const { t, i18n } = useTranslation("pages", {
    keyPrefix: "consultation-problem-report-details-page",
  });
  const report = query.data;
  const consultation = report?.consultation || {};
  const locale = i18n.resolvedLanguage || language;
  const date = (value) => formatDate(value, report?.timezone, locale);
  const source = (value) => translated(value || "unknown", "sources", t);
  const contextRows = Object.entries(report?.callContext || {})
    .filter(
      ([, value]) => value !== null && value !== undefined && value !== ""
    )
    .map(([key, value]) => [
      `context.${key}`,
      ["connectionState", "connectionQuality"].includes(key) && value
        ? translated(value, "states", t)
        : value,
    ]);
  const bookingRows = [
    ["organization", report?.organizationName],
    ["campaign", report?.campaignName],
    ["sponsor", report?.sponsorName],
    [
      "booking_source",
      consultation.bookedFrom
        ? translated(consultation.bookedFrom, "booking_sources", t)
        : null,
    ],
    ["created", consultation.createdAt ? date(consultation.createdAt) : null],
    ["updated", consultation.updatedAt ? date(consultation.updatedAt) : null],
    [
      "canceled_by",
      consultation.canceledBy
        ? t(consultation.canceledBy, { defaultValue: consultation.canceledBy })
        : null,
    ],
    [
      "canceled_at",
      consultation.canceledAt ? date(consultation.canceledAt) : null,
    ],
  ].filter(
    ([, value]) => value !== null && value !== undefined && value !== ""
  );
  return (
    <Page
      heading={t("detail_title")}
      classes="page__consultation-problem-report-details"
      handleGoBack={() => navigate("/reports?tab=consultation_problems")}
    >
      <Block>
        <div className="problem-report-layout" dir={i18n.dir(locale)}>
          {query.isLoading ? (
            <Loading />
          ) : query.isError ? (
            <div role="alert">
              <p className="text">{t("error")}</p>
              <Button
                label={t("retry")}
                size="sm"
                onClick={() => query.refetch()}
              />
            </div>
          ) : (
            <>
              <ReportCollapsible
                headingItems={[
                  <p key="heading" className="text">
                    <strong>{t("overview")}</strong>
                  </p>,
                ]}
              >
                <Fields
                  columns
                  rows={[
                    ["report_id", report.reportId],
                    ["submitted", date(report.submittedAt)],
                    ["reporter", t(report.reporterType)],
                    ["timezone", report.timezone || "UTC"],
                  ]}
                />
              </ReportCollapsible>
              <ReportCollapsible
                headingItems={[
                  <p key="heading" className="text">
                    <strong>{t("consultation")}</strong>
                  </p>,
                ]}
              >
                <Fields
                  columns
                  rows={[
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
                  ]}
                />
              </ReportCollapsible>
              <ReportCollapsible
                headingItems={[
                  <p key="heading" className="text">
                    <strong>{t("participants")}</strong>
                  </p>,
                ]}
              >
                <Grid>
                  {[
                    { role: "client", name: report.clientName },
                    { role: "provider", name: report.providerName },
                  ].map((person) => (
                    <GridItem key={person.role} md={4} lg={6}>
                      <p className="text">
                        <strong>{t(person.role)}</strong>
                      </p>
                      <h4>{person.name || "—"}</h4>
                      <Fields
                        rows={[
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
                        ]}
                      />
                    </GridItem>
                  ))}
                </Grid>
                <p className="small-text problem-report-note">
                  {t("current_data")}
                </p>
              </ReportCollapsible>
              {bookingRows.length > 0 && (
                <ReportCollapsible
                  headingItems={[
                    <p key="heading" className="text">
                      <strong>{t("booking")}</strong>
                    </p>,
                  ]}
                >
                  <Fields columns rows={bookingRows} />
                </ReportCollapsible>
              )}
              <ReportCollapsible
                headingItems={[
                  <p key="heading" className="text">
                    <strong>{t("technical")}</strong>
                  </p>,
                ]}
              >
                <Fields
                  columns
                  rows={[
                    ["source", source(report.source)],
                    ["device", t(report.deviceType || "unknown")],
                    [
                      "browser",
                      [report.browserName, report.browserVersion]
                        .filter(Boolean)
                        .join(" "),
                    ],
                    [
                      "os",
                      [report.osName, report.osVersion]
                        .filter(Boolean)
                        .join(" "),
                    ],
                    ...(report.appVersion
                      ? [["app_version", report.appVersion]]
                      : []),
                    ["language", report.interfaceLanguage],
                    ...(report.reporterTimezone &&
                    report.reporterTimezone !== report.timezone
                      ? [["reporter_timezone", report.reporterTimezone]]
                      : []),
                  ]}
                />
                {contextRows.length > 0 && (
                  <div className="problem-report-call-context">
                    <Fields columns rows={contextRows} />
                  </div>
                )}
                <p className="small-text problem-report-note">
                  {t("quality_note")}
                </p>
              </ReportCollapsible>
            </>
          )}
        </div>
      </Block>
    </Page>
  );
};
