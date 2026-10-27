import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

import { Page } from "#blocks";
import {
  Box,
  Block,
  DateInput,
  DropdownWithLabel,
  Grid,
  GridItem,
  Icon,
  Loading,
} from "@USupport-components-library/src";
import { adminSvc, cmsSvc } from "@USupport-components-library/services";

import "./program-statistics.scss";

ChartJS.register(ArcElement, ChartTooltip);

const BREAKDOWN_COLORS = [
  "#20809E",
  "#7EC8E3",
  "#3D527B",
  "#5BA8A0",
  "#E8A87C",
  "#C38D9E",
  "#85CDCA",
  "#E27D60",
];

const SUMMARY_CARD_META = {
  web_visits: { icon: "view", tone: "blue" },
  unique_visitors: { icon: "two-people", tone: "green" },
  resource_views: { icon: "document", tone: "purple" },
  unique_viewers: { icon: "person", tone: "orange" },
};

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

const formatPercent = (count, total) => {
  if (!total) return "0%";
  const value = (count / total) * 100;
  return `${Number.isInteger(value) ? value : value.toFixed(1)}%`;
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

const SummaryMetricCard = ({ label, value, icon, tone }) => {
  const { t } = useTranslation("pages", { keyPrefix: "pl-statistics-page" });

  return (
    <Box classes="program-statistics__metric" borderSize="md" boxShadow={2}>
      <div
        className={`program-statistics__metric-icon program-statistics__metric-icon--${tone}`}
        aria-hidden="true"
      >
        <Icon name={icon} size="md" color="#FFFFFF" />
      </div>
      <div className="program-statistics__metric-copy">
        <p className="program-statistics__metric-value">{value}</p>
        <h3 className="program-statistics__metric-label">{t(label)}</h3>
      </div>
    </Box>
  );
};

const BreakdownToggle = ({ value, onChange }) => {
  const { t } = useTranslation("pages", { keyPrefix: "pl-statistics-page" });
  const options = [
    { value: "pillar", label: t("by_pillar") },
    { value: "format", label: t("by_format") },
  ];

  return (
    <div
      className="program-statistics__toggle"
      role="tablist"
      aria-label={t("views_breakdown")}
    >
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`program-statistics__toggle-btn${
              isActive ? " program-statistics__toggle-btn--active" : ""
            }`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

const BreakdownDonut = ({ items, total, centerLabel }) => {
  const chartData = useMemo(
    () => ({
      labels: items.map((item) => item.label),
      datasets: [
        {
          data: items.length ? items.map((item) => item.count) : [1],
          backgroundColor: items.length
            ? items.map((item) => item.color)
            : ["#E6F1F4"],
          borderWidth: 0,
          hoverOffset: 2,
        },
      ],
    }),
    [items]
  );

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: "72%",
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: items.length > 0,
          callbacks: {
            label: (context) => {
              const count = context.raw || 0;
              return `${context.label}: ${count} (${formatPercent(
                count,
                total
              )})`;
            },
          },
        },
      },
    }),
    [items.length, total]
  );

  return (
    <div className="program-statistics__donut">
      <div className="program-statistics__donut-chart">
        <Doughnut data={chartData} options={chartOptions} />
        <div className="program-statistics__donut-center">
          <p className="program-statistics__donut-total">{total}</p>
          <p className="program-statistics__donut-caption">{centerLabel}</p>
        </div>
      </div>
    </div>
  );
};

const BreakdownBars = ({
  items,
  emptyLabel,
  total,
  categoryLabel,
  viewsLabel,
}) => {
  if (!items.length) {
    return <p className="program-statistics__empty">{emptyLabel}</p>;
  }

  return (
    <div className="program-statistics__table">
      <div className="program-statistics__table-head">
        <span>{categoryLabel}</span>
        <span aria-hidden="true" />
        <span>{viewsLabel}</span>
        <span>%</span>
      </div>
      <ul className="program-statistics__bars">
        {items.map(({ key, label, count, color }) => {
          const percentOfMax = total
            ? Math.max((count / total) * 100, 4)
            : 0;
          return (
            <li key={key} className="program-statistics__bar-row">
              <div className="program-statistics__bar-name">
                <span
                  className="program-statistics__bar-dot"
                  style={{ backgroundColor: color }}
                  aria-hidden="true"
                />
                <span className="program-statistics__bar-label" title={label}>
                  {label}
                </span>
              </div>
              <div className="program-statistics__bar-track" aria-hidden="true">
                <div
                  className="program-statistics__bar-fill"
                  style={{
                    width: `${percentOfMax}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
              <span className="program-statistics__bar-count">{count}</span>
              <span className="program-statistics__bar-percent">
                {formatPercent(count, total)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
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
    return grouped.map(({ key, count }, index) => ({
      key,
      label: pillarNameByKey.get(key) || key,
      count,
      color: BREAKDOWN_COLORS[index % BREAKDOWN_COLORS.length],
    }));
  }, [engagements, assetsById, pillarNameByKey]);

  const formatItems = useMemo(() => {
    const grouped = groupCounts(
      engagements,
      assetsById,
      (asset) => asset?.format || null
    );
    const byFormat = new Map(grouped.map((x) => [x.key, x.count]));
    return HOSN_FORMATS.map((format, index) => ({
      key: format,
      label: t(`format_${format}`),
      count: byFormat.get(format) || 0,
      color: BREAKDOWN_COLORS[index % BREAKDOWN_COLORS.length],
    })).filter((x) => x.count > 0);
  }, [engagements, assetsById, t]);

  const breakdownItems = breakdown === "pillar" ? pillarItems : formatItems;
  const breakdownTotal = breakdownItems.reduce(
    (sum, item) => sum + item.count,
    0
  );

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
              {summaryCards.map(({ label, value }) => {
                const meta = SUMMARY_CARD_META[label] || {
                  icon: "info",
                  tone: "blue",
                };
                return (
                  <GridItem md={4} lg={3} key={label}>
                    <SummaryMetricCard
                      label={label}
                      value={value}
                      icon={meta.icon}
                      tone={meta.tone}
                    />
                  </GridItem>
                );
              })}
            </Grid>

            <Box
              classes="program-statistics__breakdown"
              borderSize="md"
              boxShadow={1}
            >
              <div className="program-statistics__breakdown-header">
                <div className="program-statistics__breakdown-copy">
                  <h3 className="program-statistics__breakdown-title">
                    {t("views_breakdown")}
                  </h3>
                  <p className="program-statistics__breakdown-subtitle">
                    {t("views_breakdown_subtitle")}
                  </p>
                </div>
                <BreakdownToggle value={breakdown} onChange={setBreakdown} />
              </div>

              <div className="program-statistics__breakdown-body">
                <BreakdownDonut
                  items={breakdownItems}
                  total={breakdownTotal}
                  centerLabel={t("total_resource_views_label")}
                />
                <BreakdownBars
                  items={breakdownItems}
                  emptyLabel={t("no_data")}
                  total={breakdownTotal}
                  categoryLabel={
                    breakdown === "pillar"
                      ? t("breakdown_column_pillar")
                      : t("breakdown_column_type")
                  }
                  viewsLabel={t("breakdown_column_views")}
                />
              </div>
            </Box>
          </>
        )}
      </Block>
    </Page>
  );
};
