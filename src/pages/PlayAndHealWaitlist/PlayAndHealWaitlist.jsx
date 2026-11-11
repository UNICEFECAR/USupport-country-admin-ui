import React, { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

import { Page } from "#blocks";
import { BaseTable, Block, Loading } from "@USupport-components-library/src";
import { adminSvc } from "@USupport-components-library/services";
import {
  downloadCSVFile,
  getDateView,
  getTimeFromDate,
} from "@USupport-components-library/utils";

import "./play-and-heal-waitlist.scss";

const csvCell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

const formatJoined = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${getDateView(date)} ${getTimeFromDate(date)}`;
};

/**
 * PlayAndHealWaitlist
 *
 * Facilitators-network signups for the Play and Heal country admin
 */
export const PlayAndHealWaitlist = () => {
  const { t, i18n } = useTranslation("pages", {
    keyPrefix: "ps-waitlist-page",
  });
  const country = localStorage.getItem("country");
  const language = localStorage.getItem("language") || "en";
  const isPlayAndHeal = country === "PS";

  const { data, isLoading, isFetching } = useQuery(
    ["ps-waitlist"],
    () => adminSvc.getPlayAndHealWaitlist().then((res) => res.data || []),
    { enabled: isPlayAndHeal }
  );

  const entries = useMemo(
    () =>
      (data || []).map((entry) => ({
        id: entry.playandheal_waitlist_id,
        fullName: entry.full_name || "",
        email: entry.email || "",
        location: entry.location || "",
        locationLabel: entry.location || "—",
        languageLabel: entry.language
          ? t(`language_${entry.language}`, {
              defaultValue: String(entry.language).toUpperCase(),
            })
          : "—",
        createdAt: entry.created_at,
        joinedLabel: formatJoined(entry.created_at),
      })),
    [data, t]
  );

  const [dataToDisplay, setDataToDisplay] = useState([]);

  useEffect(() => {
    setDataToDisplay(entries);
  }, [entries]);

  const tableRows = useMemo(
    () => [
      { label: t("full_name"), sortingKey: "fullName" },
      { label: t("email"), sortingKey: "email" },
      { label: t("location"), sortingKey: "locationLabel" },
      { label: t("language"), sortingKey: "languageLabel" },
      { label: t("joined"), sortingKey: "createdAt", isDate: true },
    ],
    [t]
  );

  const rowsData = useMemo(
    () =>
      dataToDisplay.map((entry) => [
        <p key="name" className="text">
          {entry.fullName}
        </p>,
        <p key="email" className="text">
          {entry.email}
        </p>,
        <p key="location" className="text">
          {entry.locationLabel}
        </p>,
        <p key="language" className="text">
          {entry.languageLabel}
        </p>,
        <p key="joined" className="text">
          {entry.joinedLabel}
        </p>,
      ]),
    [dataToDisplay]
  );

  const handleExport = () => {
    const header = [
      t("full_name"),
      t("email"),
      t("location"),
      t("language"),
      t("joined"),
    ]
      .map(csvCell)
      .join(",");

    const lines = entries.map((entry) =>
      [
        entry.fullName,
        entry.email,
        entry.location,
        entry.languageLabel,
        entry.createdAt ? new Date(entry.createdAt).toISOString() : "",
      ]
        .map(csvCell)
        .join(",")
    );

    const reportDate = new Date().toISOString().split("T")[0];
    downloadCSVFile(
      `\uFEFF${[header, ...lines].join("\n")}`,
      `playandheal-waitlist-${reportDate}.csv`
    );
  };

  if (!isPlayAndHeal) {
    return (
      <Navigate
        to={`/country-admin/${language}/content-management?tab=articles`}
        replace
      />
    );
  }

  const IS_RTL = i18n.language === "ar";

  return (
    <Page
      classes={`play-and-heal-waitlist ${
        IS_RTL ? "play-and-heal-waitlist--rtl" : ""
      }`}
      heading={t("heading")}
      showGoBackArrow={false}
    >
      <Block>
        {isLoading ? (
          <Loading size="lg" />
        ) : (
          <BaseTable
            data={dataToDisplay}
            rows={tableRows}
            rowsData={rowsData}
            updateData={setDataToDisplay}
            hasMenu={false}
            hasSearch
            t={t}
            isLoading={isFetching}
            buttonLabel={t("export")}
            buttonAction={handleExport}
            isButtonDisabled={!entries.length}
          />
        )}
      </Block>
    </Page>
  );
};
