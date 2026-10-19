import React from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

import { Page } from "#blocks";
import {
  Box,
  Block,
  Grid,
  GridItem,
  Loading,
} from "@USupport-components-library/src";
import { adminSvc } from "@USupport-components-library/services";

import "./program-statistics.scss";

const countEvents = (eventType) => (events) =>
  events.filter((e) => e.event_type === eventType).length;

const countUniqueVisitors = (events) =>
  new Set(events.map((e) => e.visitor_id).filter(Boolean)).size;

/**
 * ProgramStatistics
 *
 * Visit statistics of a programme website (Play and Heal, Hosn El Hal),
 * shown to the admins of its pseudo-country
 *
 * @param {string} queryKey - react-query key
 * @param {function} getVisits - fetches the programme's visit events
 * @param {{label: string, count: function}[]} stats - cards: translation key and a counter over the events
 * @returns {JSX.Element}
 */
export const ProgramStatistics = ({ queryKey, getVisits, stats }) => {
  const { t } = useTranslation("pages", { keyPrefix: "pl-statistics-page" });

  const { data, isLoading } = useQuery([queryKey], () =>
    getVisits().then((res) => res.data)
  );

  const events = data || [];

  const IS_RTL = localStorage.getItem("language") === "ar";
  return (
    <Page
      classes={`program-statistics ${IS_RTL ? "program-statistics--rtl" : ""}`}
      heading={t("heading")}
      showGoBackArrow={false}
    >
      <Block>
        <Grid>
          {isLoading ? (
            <GridItem md={8} lg={12}>
              <Loading size="lg" />
            </GridItem>
          ) : (
            stats.map(({ label, count }) => (
              <GridItem md={4} lg={6} key={label}>
                <Box
                  classes="program-statistics__item"
                  borderSize="lg"
                  boxShadow={2}
                >
                  <h3>{t(label)}</h3>
                  <div>{count(events)}</div>
                </Box>
              </GridItem>
            ))
          )}
        </Grid>
      </Block>
    </Page>
  );
};

const PLAY_AND_HEAL_STATS = [
  { label: "web_visits", count: (events) => events.length },
  { label: "qr_visits", count: countEvents("playandheal_visit_qr") },
];

export const PlayAndHealStatistics = () => (
  <ProgramStatistics
    queryKey="pl-playandheal-visits"
    getVisits={adminSvc.getPlayAndHealVisits}
    stats={PLAY_AND_HEAL_STATS}
  />
);

const HOSN_EL_HAL_STATS = [
  { label: "web_visits", count: (events) => events.length },
  { label: "unique_visitors", count: countUniqueVisitors },
];

export const HosnElHalStatistics = () => (
  <ProgramStatistics
    queryKey="hosnelhal-visits"
    getVisits={adminSvc.getHosnElHalVisits}
    stats={HOSN_EL_HAL_STATS}
  />
);
