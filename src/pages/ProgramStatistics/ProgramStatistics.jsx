import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

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
  Tabs,
} from "@USupport-components-library/src";
import { adminSvc, cmsSvc } from "@USupport-components-library/services";

import "./program-statistics.scss";

const countEvents = (eventType) => (events) =>
  events.filter((e) => e.event_type === eventType).length;

const countUniqueVisitors = (events) =>
  new Set(events.map((e) => e.visitor_id).filter(Boolean)).size;

const HOSN_FORMATS = ["video", "audio", "worksheet", "thumbnail"];

const BREAKDOWN_COLORS = [
  "#20809e",
  "#7ec8e3",
  "#54cfd9",
  "#9749fa",
  "#fb6514",
  "#3d527b",
];

const TONE_ICON_COLORS = {
  blue: "#20809e",
  green: "#1a9ea8",
  purple: "#9749fa",
  orange: "#fb6514",
};

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

const polarToCartesian = (cx, cy, radius, angleInDegrees) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
};

const describeArc = (cx, cy, radius, startAngle, endAngle) => {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(" ");
};

const DonutChart = ({ items, total, centerLabel }) => {
  const [tooltip, setTooltip] = useState(null);
  const size = 220;
  const stroke = 28;
  const radius = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;

  if (!total) {
    return (
      <div className="program-statistics__donut">
        <svg viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="#e6eaf0"
            strokeWidth={stroke}
          />
        </svg>
        <div className="program-statistics__donut-center">
          <strong>0</strong>
          <span>{centerLabel}</span>
        </div>
      </div>
    );
  }

  let angle = 0;
  const segments = items.map((item) => {
    const sweep = (item.count / total) * 360;
    const startAngle = angle;
    const endAngle = angle + Math.max(sweep, item.count > 0 ? 0.8 : 0);
    angle = endAngle;
    return { ...item, startAngle, endAngle };
  });

  const showTooltip = (event, segment) => {
    const rect = event.currentTarget.ownerSVGElement.getBoundingClientRect();
    setTooltip({
      label: segment.label,
      count: segment.count,
      percent: segment.percent,
      color: segment.color,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  return (
    <div className="program-statistics__donut">
      <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-label={centerLabel}>
        {segments.map((segment) =>
          segment.count > 0 ? (
            <path
              key={segment.key}
              className="program-statistics__donut-segment"
              d={describeArc(
                cx,
                cy,
                radius,
                segment.startAngle,
                segment.endAngle
              )}
              fill="none"
              stroke={segment.color}
              strokeWidth={stroke}
              strokeLinecap="butt"
              onMouseEnter={(event) => showTooltip(event, segment)}
              onMouseMove={(event) => showTooltip(event, segment)}
              onMouseLeave={() => setTooltip(null)}
            />
          ) : null
        )}
      </svg>
      <div className="program-statistics__donut-center">
        <strong>{total}</strong>
        <span>{centerLabel}</span>
      </div>
      {tooltip && (
        <div
          className="program-statistics__donut-tooltip"
          style={{ left: tooltip.x, top: tooltip.y }}
          role="tooltip"
        >
          <span
            className="program-statistics__donut-tooltip-dot"
            style={{ background: tooltip.color }}
            aria-hidden="true"
          />
          <span className="program-statistics__donut-tooltip-label">
            {tooltip.label}
          </span>
          <span className="program-statistics__donut-tooltip-value">
            {tooltip.count}
            {tooltip.percent ? ` · ${tooltip.percent}` : ""}
          </span>
        </div>
      )}
    </div>
  );
};

const BreakdownTable = ({
  items,
  emptyLabel,
  categoryLabel,
  viewsLabel,
  percentageLabel,
  total,
}) => {
  if (!items.length) {
    return <p className="program-statistics__empty">{emptyLabel}</p>;
  }

  return (
    <div className="program-statistics__table-wrap">
      <div className="program-statistics__table-head">
        <span>{categoryLabel}</span>
        <span className="program-statistics__table-num">{viewsLabel}</span>
        <span className="program-statistics__table-num">{percentageLabel}</span>
      </div>
      <ul className="program-statistics__bars">
        {items.map(({ key, label, count, color, percent }) => {
          const barWidth = total ? Math.round((count / total) * 100) : 0;
          return (
            <li key={key} className="program-statistics__bar-row">
              <div className="program-statistics__bar-meta">
                <div className="program-statistics__bar-name">
                  <span
                    className="program-statistics__bar-dot"
                    style={{ background: color }}
                    aria-hidden="true"
                  />
                  <span className="program-statistics__bar-label" title={label}>
                    {label}
                  </span>
                </div>
                <span className="program-statistics__bar-count">{count}</span>
                <span className="program-statistics__bar-percent">{percent}</span>
              </div>
              <div className="program-statistics__bar-track" aria-hidden="true">
                <div
                  className="program-statistics__bar-fill"
                  style={{ width: `${barWidth}%`, background: color }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
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
            stats.map(({ label, count, icon, tone }) => (
              <GridItem md={4} lg={6} key={label}>
                <Box
                  classes={`program-statistics__item program-statistics__item--${
                    tone || "blue"
                  }`}
                  borderSize="md"
                  boxShadow={2}
                >
                  <div
                    className="program-statistics__item-icon"
                    aria-hidden="true"
                  >
                    <Icon
                      name={icon || "view"}
                      size="md"
                      color={TONE_ICON_COLORS[tone || "blue"]}
                    />
                  </div>
                  <div className="program-statistics__item-copy">
                    <p className="program-statistics__item-value">
                      {count(events)}
                    </p>
                    <h3 className="program-statistics__item-label">
                      {t(label)}
                    </h3>
                  </div>
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
  {
    label: "web_visits",
    count: (events) => events.length,
    icon: "view",
    tone: "blue",
  },
  {
    label: "qr_visits",
    count: countEvents("playandheal_visit_qr"),
    icon: "document",
    tone: "purple",
  },
];

export const PlayAndHealStatistics = () => (
  <ProgramStatistics
    queryKey="pl-playandheal-visits"
    getVisits={adminSvc.getPlayAndHealVisits}
    stats={PLAY_AND_HEAL_STATS}
  />
);

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
  const feedbackQuery = useQuery(
    ["hosnelhal-feedback", dateQuery.startDate, dateQuery.endDate],
    () => adminSvc.getHosnElHalFeedback(dateQuery).then((res) => res.data || [])
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
    feedbackQuery.isLoading ||
    assetsQuery.isLoading ||
    visitsQuery.isFetching ||
    engagementsQuery.isFetching ||
    feedbackQuery.isFetching;

  const visits = visitsQuery.data || [];
  const engagements = engagementsQuery.data || [];
  const feedback = feedbackQuery.data || [];
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

  const feedbackSummary = useMemo(() => {
    const up = countEvents("hosnelhal_feedback_up")(feedback);
    const down = countEvents("hosnelhal_feedback_down")(feedback);
    const votes = up + down;
    return {
      up,
      down,
      recommendRate: votes ? `${Math.round((up / votes) * 100)}%` : "–",
      surveyClicks: countEvents("hosnelhal_feedback_survey_click")(feedback),
    };
  }, [feedback]);

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

  const rawBreakdownItems =
    breakdown === "pillar" ? pillarItems : formatItems;
  const totalViews = rawBreakdownItems.reduce(
    (sum, item) => sum + item.count,
    0
  );

  const breakdownItems = useMemo(
    () =>
      rawBreakdownItems.map((item, index) => ({
        ...item,
        color: BREAKDOWN_COLORS[index % BREAKDOWN_COLORS.length],
        percent: totalViews
          ? `${((item.count / totalViews) * 100).toFixed(1)}%`
          : "0%",
      })),
    [rawBreakdownItems, totalViews]
  );

  const IS_RTL = localStorage.getItem("language") === "ar";

  const summaryCards = [
    {
      label: "web_visits",
      value: summary.siteVisits,
      icon: "view",
      tone: "blue",
    },
    {
      label: "unique_visitors",
      value: summary.uniqueVisitors,
      icon: "two-people",
      tone: "green",
    },
    {
      label: "resource_views",
      value: summary.resourceViews,
      icon: "document",
      tone: "purple",
    },
    {
      label: "unique_viewers",
      value: summary.uniqueViewers,
      icon: "person",
      tone: "orange",
    },
  ];

  const feedbackCards = [
    {
      label: "feedback_up",
      value: feedbackSummary.up,
      icon: "like",
      tone: "green",
    },
    {
      label: "feedback_down",
      value: feedbackSummary.down,
      icon: "dislike",
      tone: "orange",
    },
    {
      label: "feedback_recommend_rate",
      value: feedbackSummary.recommendRate,
      icon: "star-full",
      tone: "blue",
    },
    {
      label: "feedback_survey_clicks",
      value: feedbackSummary.surveyClicks,
      icon: "share",
      tone: "purple",
    },
  ];

  const renderSummaryCard = ({ label, value, icon, tone }) => (
    <GridItem md={4} lg={3} key={label}>
      <Box
        classes={`program-statistics__item program-statistics__item--${tone}`}
        borderSize="md"
        boxShadow={2}
      >
        <div className="program-statistics__item-icon" aria-hidden="true">
          <Icon name={icon} size="md" color={TONE_ICON_COLORS[tone]} />
        </div>
        <div className="program-statistics__item-copy">
          <p className="program-statistics__item-value">{value}</p>
          <h3 className="program-statistics__item-label">{t(label)}</h3>
        </div>
      </Box>
    </GridItem>
  );

  const breakdownTabs = [
    {
      value: "pillar",
      label: t("by_pillar"),
      isSelected: breakdown === "pillar",
    },
    {
      value: "format",
      label: t("by_type"),
      isSelected: breakdown === "format",
    },
  ];

  const handleBreakdownTabSelect = (index) => {
    setBreakdown(breakdownTabs[index].value);
  };

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
              {summaryCards.map(renderSummaryCard)}
            </Grid>

            <Box
              classes="program-statistics__breakdown"
              borderSize="md"
              boxShadow={1}
            >
              <div className="program-statistics__breakdown-header">
                <div className="program-statistics__breakdown-heading">
                  <h3 className="program-statistics__breakdown-title">
                    {t("views_breakdown")}
                  </h3>
                  <p className="program-statistics__breakdown-subtitle">
                    {t("views_breakdown_subtitle")}
                  </p>
                </div>
                <div className="program-statistics__breakdown-tabs">
                  <Tabs
                    options={breakdownTabs}
                    handleSelect={handleBreakdownTabSelect}
                  />
                </div>
              </div>

              <div className="program-statistics__breakdown-body">
                <DonutChart
                  items={breakdownItems}
                  total={totalViews}
                  centerLabel={t("total_resource_views_label")}
                />
                <BreakdownTable
                  items={breakdownItems}
                  emptyLabel={t("no_data")}
                  categoryLabel={
                    breakdown === "pillar"
                      ? t("pillar_column")
                      : t("type_column")
                  }
                  viewsLabel={t("views_column")}
                  percentageLabel={t("percentage_column")}
                  total={totalViews}
                />
              </div>
            </Box>

            <Box
              classes="program-statistics__feedback"
              borderSize="md"
              boxShadow={1}
            >
              <div className="program-statistics__breakdown-heading">
                <h3 className="program-statistics__breakdown-title">
                  {t("feedback_title")}
                </h3>
                <p className="program-statistics__breakdown-subtitle">
                  {t("feedback_subtitle")}
                </p>
              </div>
              <Grid classes="program-statistics__summary">
                {feedbackCards.map(renderSummaryCard)}
              </Grid>
            </Box>
          </>
        )}
      </Block>
    </Page>
  );
};
