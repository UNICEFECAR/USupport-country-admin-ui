import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

import { Page } from "#blocks";
import {
  BaseTable,
  Block,
  Button,
  DropdownWithLabel,
  Loading,
  Modal,
} from "@USupport-components-library/src";
import { adminSvc, cmsSvc } from "@USupport-components-library/services";

import "./hosn-resources.scss";

const HOSN_FORMATS = ["video", "audio", "worksheet", "thumbnail"];

const HOSN_LANGUAGES = [
  { value: "en", labelKey: "locale_en" },
  { value: "ar", labelKey: "locale_ar" },
];

const ALL = "all";

const defaultFilters = {
  format: ALL,
  pillar: ALL,
  locale: ALL,
  views: ALL,
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

/**
 * HosnResources
 *
 * Read-only list of Hosn El Hal assets with engagement view counts
 */
export const HosnResources = () => {
  const { t, i18n } = useTranslation("pages", {
    keyPrefix: "hosn-resources-page",
  });
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
  const [draftFilters, setDraftFilters] = useState(defaultFilters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dataToDisplay, setDataToDisplay] = useState([]);

  const assetQueryParams = useMemo(
    () => ({
      locale: appliedFilters.locale === ALL ? "all" : appliedFilters.locale,
      format:
        appliedFilters.format === ALL ? undefined : appliedFilters.format,
      pillar:
        appliedFilters.pillar === ALL ? undefined : appliedFilters.pillar,
      limit: 500,
    }),
    [appliedFilters.locale, appliedFilters.format, appliedFilters.pillar]
  );

  const assetsQuery = useQuery(
    ["hosn-assets-admin", assetQueryParams],
    async () => {
      const { data } = await cmsSvc.getHosnAssets(assetQueryParams);
      return mapCmsAssets(data?.data || []);
    }
  );

  const engagementsQuery = useQuery(["hosnelhal-engagements"], () =>
    adminSvc.getHosnElHalEngagements().then((res) => res.data || [])
  );

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

  const viewsByAssetId = useMemo(() => {
    const counts = new Map();
    (engagementsQuery.data || []).forEach((event) => {
      const id = Number(event.content_id);
      counts.set(id, (counts.get(id) || 0) + 1);
    });
    return counts;
  }, [engagementsQuery.data]);

  const rows = useMemo(() => {
    const assets = assetsQuery.data || [];
    return assets
      .map((asset) => ({
        ...asset,
        views: viewsByAssetId.get(Number(asset.id)) || 0,
        formatLabel: t(`format_${asset.format}`, {
          defaultValue: asset.format,
        }),
        pillarLabel: asset.pillarName || asset.pillarKey || "—",
        localeLabel: asset.locale
          ? t(`locale_${asset.locale}`, {
              defaultValue: asset.locale.toUpperCase(),
            })
          : "—",
      }))
      .filter((asset) => {
        if (appliedFilters.views === "with_views" && asset.views === 0) {
          return false;
        }
        if (appliedFilters.views === "no_views" && asset.views > 0) {
          return false;
        }
        return true;
      })
      .sort((a, b) => b.views - a.views || a.title.localeCompare(b.title));
  }, [assetsQuery.data, viewsByAssetId, appliedFilters.views, t]);

  useEffect(() => {
    setDataToDisplay(rows);
  }, [rows]);

  const pillarOptions = useMemo(() => {
    const fromCms = pillarsQuery.data || [];
    return [
      { value: ALL, label: t("all_pillars") },
      ...fromCms
        .filter((p) => p.key)
        .map((p) => ({
          value: p.key,
          label: p.name || p.key,
        })),
    ];
  }, [pillarsQuery.data, t]);

  const formatOptions = useMemo(
    () => [
      { value: ALL, label: t("all_formats") },
      ...HOSN_FORMATS.map((value) => ({
        value,
        label: t(`format_${value}`),
      })),
    ],
    [t]
  );

  const localeOptions = useMemo(
    () => [
      { value: ALL, label: t("all_languages") },
      ...HOSN_LANGUAGES.map((lang) => ({
        value: lang.value,
        label: t(lang.labelKey),
      })),
    ],
    [t]
  );

  const viewsOptions = useMemo(
    () => [
      { value: ALL, label: t("all_views") },
      { value: "with_views", label: t("with_views") },
      { value: "no_views", label: t("no_views") },
    ],
    [t]
  );

  const tableRows = useMemo(
    () => [
      { label: t("title"), sortingKey: "title" },
      { label: t("format"), sortingKey: "formatLabel" },
      { label: t("pillar"), sortingKey: "pillarLabel" },
      { label: t("locale"), sortingKey: "localeLabel" },
      {
        label: t("views"),
        sortingKey: "views",
        isNumbered: true,
        isCentered: true,
      },
    ],
    [t]
  );

  const rowsData = useMemo(
    () =>
      dataToDisplay.map((asset) => [
        <p key="title" className="text">
          {asset.title}
        </p>,
        <p key="format" className="text">
          {asset.formatLabel}
        </p>,
        <p key="pillar" className="text">
          {asset.pillarLabel}
        </p>,
        <p key="locale" className="text">
          {asset.localeLabel}
        </p>,
        <p key="views" className="text centered">
          {asset.views}
        </p>,
      ]),
    [dataToDisplay]
  );

  const openFilters = () => {
    setDraftFilters(appliedFilters);
    setIsFilterOpen(true);
  };

  const applyFilters = () => {
    setAppliedFilters(draftFilters);
    setIsFilterOpen(false);
  };

  const resetFilters = () => {
    setDraftFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setIsFilterOpen(false);
  };

  const updateDraft = (key, value) => {
    setDraftFilters((prev) => ({ ...prev, [key]: value }));
  };

  const isLoading = assetsQuery.isLoading || engagementsQuery.isLoading;
  const IS_RTL = i18n.language === "ar";

  return (
    <Page
      classes={`hosn-resources ${IS_RTL ? "hosn-resources--rtl" : ""}`}
      heading={t("heading")}
      showGoBackArrow={false}
      showHeadingButtonInline
      headingButton={
        <Button
          label={t("filters")}
          size="sm"
          type="secondary"
          onClick={openFilters}
        />
      }
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
            isLoading={assetsQuery.isFetching}
          />
        )}
      </Block>

      <Modal
        isOpen={isFilterOpen}
        closeModal={() => setIsFilterOpen(false)}
        heading={t("filters")}
        classes="hosn-resources__filters-modal"
      >
        <DropdownWithLabel
          label={t("format")}
          selected={draftFilters.format}
          setSelected={(value) => updateDraft("format", value)}
          options={formatOptions}
        />
        <DropdownWithLabel
          label={t("pillar")}
          selected={draftFilters.pillar}
          setSelected={(value) => updateDraft("pillar", value)}
          options={pillarOptions}
        />
        <DropdownWithLabel
          label={t("locale")}
          selected={draftFilters.locale}
          setSelected={(value) => updateDraft("locale", value)}
          options={localeOptions}
        />
        <DropdownWithLabel
          label={t("views")}
          selected={draftFilters.views}
          setSelected={(value) => updateDraft("views", value)}
          options={viewsOptions}
        />
        <Button
          label={t("apply_filters")}
          size="lg"
          onClick={applyFilters}
          classes="hosn-resources__filters-modal__cta"
        />
        <Button
          label={t("reset")}
          type="secondary"
          size="lg"
          onClick={resetFilters}
          classes="hosn-resources__filters-modal__cta"
        />
      </Modal>
    </Page>
  );
};
