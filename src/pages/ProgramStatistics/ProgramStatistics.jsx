import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

import { Page } from "#blocks";
import {
  Box,
  Block,
  Button,
  DateInput,
  DropdownWithLabel,
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

const PERIOD_ALL = "all";
const PERIOD_CUSTOM = "custom";

const toDateInputValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const defaultCustomRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 29);
  return {
    startDate: toDateInputValue(start),
    endDate: toDateInputValue(end),
  };
};

/** Resolve UI period selection into API YYYY-MM-DD bounds (or null for all time). */
const getPeriodQuery = (period, startDate, endDate) => {
  if (period === PERIOD_ALL) {
    return { startDate: undefined, endDate: undefined };
  }

  if (period === PERIOD_CUSTOM) {
    return {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };
  }

  const days = Number(period);
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  return {
    startDate: toDateInputValue(start),
    endDate: toDateInputValue(end),
  };
};

const usePeriodFilter = () => {
  const [period, setPeriod] = useState(PERIOD_ALL);
  const [customRange, setCustomRange] = useState(defaultCustomRange);

  const dateQuery = useMemo(
    () => getPeriodQuery(period, customRange.startDate, customRange.endDate),
    [period, customRange.startDate, customRange.endDate]
  );

  const handlePeriodChange = (value) => {
    setPeriod(value);
    if (value === PERIOD_CUSTOM) {
      setCustomRange(defaultCustomRange());
    }
  };

  return {
    period,
    customRange,
    setCustomRange,
    dateQuery,
    handlePeriodChange,
  };
};

const PeriodFilterBar = ({
  period,
  customRange,
  onPeriodChange,
  onCustomRangeChange,
}) => {
  const { t } = useTranslation("pages", { keyPrefix: "pl-statistics-page" });

  const periodOptions = useMemo(
    () => [
      { value: PERIOD_ALL, label: t("period_all") },
      { value: "7", label: t("period_7") },
      { value: "30", label: t("period_30") },
      { value: "90", label: t("period_90") },
      { value: PERIOD_CUSTOM, label: t("period_custom") },
    ],
    [t]
  );

  return (
    <div className="program-statistics__period">
      <DropdownWithLabel
        label={t("period")}
        selected={period}
        setSelected={onPeriodChange}
        options={periodOptions}
        classes="program-statistics__period-select"
      />
      {period === PERIOD_CUSTOM && (
        <div className="program-statistics__period-dates">
          <DateInput
            label={t("start_date")}
            value={customRange.startDate}
            onChange={(event) =>
              onCustomRangeChange({
                ...customRange,
                startDate: event.target.value,
              })
            }
          />
          <DateInput
            label={t("end_date")}
            value={customRange.endDate}
            onChange={(event) =>
              onCustomRangeChange({
                ...customRange,
                endDate: event.target.value,
              })
            }
          />
        </div>
      )}
    </div>
  );
};

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
  const {
    period,
    customRange,
    setCustomRange,
    dateQuery,
    handlePeriodChange,
  } = usePeriodFilter();

  const { data, isLoading, isFetching } = useQuery(
    [queryKey, dateQuery.startDate, dateQuery.endDate],
    () => getVisits(dateQuery).then((res) => res.data)
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
        <PeriodFilterBar
          period={period}
          customRange={customRange}
          onPeriodChange={handlePeriodChange}
          onCustomRangeChange={setCustomRange}
        />
        <Grid>
          {isLoading || isFetching ? (
            <GridItem md={8} lg={12}>
              <Loading size="lg" />
            </GridItem>
          ) : (
            stats.map(({ label, count }) => (
              <GridItem md={4} lg={6} key={label}>
                <Box
                  classes="program-statistics__item"
                  borderSize="md"
                  boxShadow={2}
                >
                  <p className="program-statistics__item-value">
                    {count(events)}
                  </p>
                  <h3 className="program-statistics__item-label">{t(label)}</h3>
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
      {items.map(({ key, label, count }) => {
        const percent = max ? Math.round((count / max) * 100) : 0;
        return (
          <li key={key} className="program-statistics__bar-row">
            <div className="program-statistics__bar-meta">
              <span className="program-statistics__bar-label" title={label}>
                {label}
              </span>
              <span className="program-statistics__bar-count">{count}</span>
            </div>
            <div className="program-statistics__bar-track" aria-hidden="true">
              <div
                className="program-statistics__bar-fill"
                style={{ width: `${percent}%` }}
              />
            </div>
          </li>
        );
      })}
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
  const {
    period,
    customRange,
    setCustomRange,
    dateQuery,
    handlePeriodChange,
  } = usePeriodFilter();

  const visitsQuery = useQuery(
    ["hosnelhal-visits", dateQuery.startDate, dateQuery.endDate],
    () => adminSvc.getHosnElHalVisits(dateQuery).then((res) => res.data || [])
  );
  const engagementsQuery = useQuery(
    ["hosnelhal-engagements", dateQuery.startDate, dateQuery.endDate],
    () =>
      adminSvc.getHosnElHalEngagements(dateQuery).then((res) => res.data || [])
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
    assetsQuery.isLoading ||
    visitsQuery.isFetching ||
    engagementsQuery.isFetching;

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
        <PeriodFilterBar
          period={period}
          customRange={customRange}
          onPeriodChange={handlePeriodChange}
          onCustomRangeChange={setCustomRange}
        />
        {isLoading ? (
          <Loading size="lg" />
        ) : (
          <>
            <Grid classes="program-statistics__summary">
              {summaryCards.map(({ label, value }) => (
                <GridItem md={4} lg={3} key={label}>
                  <Box
                    classes="program-statistics__item"
                    borderSize="md"
                    boxShadow={2}
                  >
                    <p className="program-statistics__item-value">{value}</p>
                    <h3 className="program-statistics__item-label">{t(label)}</h3>
                  </Box>
                </GridItem>
              ))}
            </Grid>

            <Box
              classes="program-statistics__breakdown"
              borderSize="md"
              boxShadow={1}
            >
              <div className="program-statistics__breakdown-header">
                <h3 className="program-statistics__breakdown-title">
                  {t("views_breakdown")}
                </h3>
                <div
                  className="program-statistics__toggles"
                  role="group"
                  aria-label={t("views_breakdown")}
                >
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
            </Box>
          </>
        )}
      </Block>
    </Page>
  );
};
