import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

import { Page } from "#blocks";
import {
  Box,
  Block,
  Button,
  Grid,
  GridItem,
  Loading,
} from "@USupport-components-library/src";
import { adminSvc, cmsSvc } from "@USupport-components-library/services";

import "./program-statistics.scss";

const countEvents = (eventType) => (events) =>
  events.filter((e) => e.event_type === eventType).length;

const countUniqueVisitors = (events) =>
  new Set(events.map((e) => e.visitor_id).filter(Boolean)).size;

const HOSN_FORMATS = ["video", "audio", "worksheet", "thumbnail"];

const mapCmsAssets = (entries = []) =>
  entries.map((entry) => {
    const attrs = entry.attributes || {};
    return {
      id: entry.id,
      title: attrs.title || "",
      format: attrs.format || "",
      locale: attrs.locale || "",
      pillarKey: attrs.pillar?.data?.attributes?.key || null,
      pillarName: attrs.pillar?.data?.attributes?.name || null,
      updatedAt: attrs.updatedAt || attrs.publishedAt || null,
    };
  });

const groupCounts = (engagements, assetsById, keyFn) => {
  const counts = {};
  engagements.forEach((event) => {
    const asset = assetsById.get(Number(event.content_id));
    const key = keyFn(asset, event);
    if (!key) return;
    counts[key] = (counts[key] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
};

/**
 * ProgramStatistics
 *
 * Visit statistics of a programme website (Play and Heal, Hosn El Hal),
 * shown to the admins of its pseudo-country
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

const BreakdownBars = ({ items, emptyLabel, max }) => {
  if (!items.length) {
    return <p className="program-statistics__empty">{emptyLabel}</p>;
  }

  return (
    <ul className="program-statistics__bars">
      {items.map(({ key, label, count }) => (
        <li key={key} className="program-statistics__bar-row">
          <span className="program-statistics__bar-label">{label}</span>
          <div className="program-statistics__bar-track" aria-hidden="true">
            <div
              className="program-statistics__bar-fill"
              style={{ width: `${max ? Math.round((count / max) * 100) : 0}%` }}
            />
          </div>
          <span className="program-statistics__bar-count">{count}</span>
        </li>
      ))}
    </ul>
  );
};

/**
 * Hosn El Hal statistics: site visits + resource views with pillar/format breakdown
 */
export const HosnElHalStatistics = () => {
  const { t, i18n } = useTranslation("pages", {
    keyPrefix: "pl-statistics-page",
  });
  const [breakdown, setBreakdown] = useState("pillar");

  const visitsQuery = useQuery(["hosnelhal-visits"], () =>
    adminSvc.getHosnElHalVisits().then((res) => res.data || [])
  );
  const engagementsQuery = useQuery(["hosnelhal-engagements"], () =>
    adminSvc.getHosnElHalEngagements().then((res) => res.data || [])
  );
  const assetsQuery = useQuery(["hosn-assets-admin", "all"], async () => {
    const { data } = await cmsSvc.getHosnAssets({ locale: "all", limit: 500 });
    return mapCmsAssets(data?.data || []);
  });
  const pillarsQuery = useQuery(
    ["hosn-pillars-admin", i18n.language],
    async () => {
      const { data } = await cmsSvc.getHosnPillars(i18n.language);
      return (data?.data || []).map((entry) => ({
        key: entry.attributes?.key,
        name: entry.attributes?.name,
      }));
    }
  );

  const isLoading =
    visitsQuery.isLoading ||
    engagementsQuery.isLoading ||
    assetsQuery.isLoading;

  const visits = visitsQuery.data || [];
  const engagements = engagementsQuery.data || [];
  const assets = assetsQuery.data || [];
  const pillars = pillarsQuery.data || [];

  const assetsById = useMemo(() => {
    const map = new Map();
    assets.forEach((asset) => map.set(Number(asset.id), asset));
    return map;
  }, [assets]);

  const pillarNameByKey = useMemo(() => {
    const map = new Map();
    pillars.forEach((p) => map.set(p.key, p.name));
    assets.forEach((a) => {
      if (a.pillarKey && a.pillarName && !map.has(a.pillarKey)) {
        map.set(a.pillarKey, a.pillarName);
      }
    });
    return map;
  }, [pillars, assets]);

  const summary = useMemo(
    () => ({
      siteVisits: visits.length,
      uniqueVisitors: countUniqueVisitors(visits),
      resourceViews: engagements.length,
      uniqueViewers: countUniqueVisitors(engagements),
    }),
    [visits, engagements]
  );

  const pillarItems = useMemo(() => {
    const grouped = groupCounts(
      engagements,
      assetsById,
      (asset) => asset?.pillarKey || null
    );
    return grouped.map(({ key, count }) => ({
      key,
      label: pillarNameByKey.get(key) || key,
      count,
    }));
  }, [engagements, assetsById, pillarNameByKey]);

  const formatItems = useMemo(() => {
    const grouped = groupCounts(
      engagements,
      assetsById,
      (asset) => asset?.format || null
    );
    const byFormat = new Map(grouped.map((x) => [x.key, x.count]));
    return HOSN_FORMATS.map((format) => ({
      key: format,
      label: t(`format_${format}`),
      count: byFormat.get(format) || 0,
    })).filter((x) => x.count > 0);
  }, [engagements, assetsById, t]);

  const breakdownItems = breakdown === "pillar" ? pillarItems : formatItems;
  const maxCount = breakdownItems[0]?.count || 0;

  const IS_RTL = localStorage.getItem("language") === "ar";

  const summaryCards = [
    { label: "web_visits", value: summary.siteVisits },
    { label: "unique_visitors", value: summary.uniqueVisitors },
    { label: "resource_views", value: summary.resourceViews },
    { label: "unique_viewers", value: summary.uniqueViewers },
  ];

  return (
    <Page
      classes={`program-statistics ${IS_RTL ? "program-statistics--rtl" : ""}`}
      heading={t("heading")}
      showGoBackArrow={false}
    >
      <Block>
        {isLoading ? (
          <Loading size="lg" />
        ) : (
          <>
            <Grid classes="program-statistics__summary">
              {summaryCards.map(({ label, value }) => (
                <GridItem md={4} lg={3} key={label}>
                  <Box
                    classes="program-statistics__item"
                    borderSize="lg"
                    boxShadow={2}
                  >
                    <h3>{t(label)}</h3>
                    <div>{value}</div>
                  </Box>
                </GridItem>
              ))}
            </Grid>

            <div className="program-statistics__breakdown">
              <div className="program-statistics__breakdown-header">
                <h3>{t("views_breakdown")}</h3>
                <div className="program-statistics__toggles">
                  <Button
                    type={breakdown === "pillar" ? "primary" : "secondary"}
                    size="sm"
                    label={t("by_pillar")}
                    onClick={() => setBreakdown("pillar")}
                  />
                  <Button
                    type={breakdown === "format" ? "primary" : "secondary"}
                    size="sm"
                    label={t("by_format")}
                    onClick={() => setBreakdown("format")}
                  />
                </div>
              </div>
              <BreakdownBars
                items={breakdownItems}
                emptyLabel={t("no_data")}
                max={maxCount}
              />
            </div>
          </>
        )}
      </Block>
    </Page>
  );
};
