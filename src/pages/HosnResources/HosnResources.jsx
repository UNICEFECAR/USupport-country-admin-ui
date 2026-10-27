import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

import { Page } from "#blocks";
import { useDebounce } from "#hooks";
import {
  Block,
  Button,
  DropdownWithLabel,
  InputSearch,
  Loading,
} from "@USupport-components-library/src";
import { adminSvc, cmsSvc } from "@USupport-components-library/services";

import "./hosn-resources.scss";

const HOSN_FORMATS = ["video", "audio", "worksheet", "thumbnail"];

const HOSN_LANGUAGES = [
  { value: "en", labelKey: "locale_en" },
  { value: "ar", labelKey: "locale_ar" },
];

const ALL = "all";

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
  const [search, setSearch] = useState("");
  const [format, setFormat] = useState(ALL);
  const [pillar, setPillar] = useState(ALL);
  const [locale, setLocale] = useState(ALL);
  const [viewsFilter, setViewsFilter] = useState(ALL);
  const debouncedSearch = useDebounce(search.trim(), 400);

  const assetQueryParams = useMemo(
    () => ({
      locale: locale === ALL ? "all" : locale,
      search: debouncedSearch || undefined,
      format: format === ALL ? undefined : format,
      pillar: pillar === ALL ? undefined : pillar,
      limit: 500,
    }),
    [locale, debouncedSearch, format, pillar]
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

  const rows = useMemo(() => {
    const assets = assetsQuery.data || [];
    return assets
      .map((asset) => ({
        ...asset,
        views: viewsByAssetId.get(Number(asset.id)) || 0,
      }))
      .filter((asset) => {
        if (viewsFilter === "with_views" && asset.views === 0) return false;
        if (viewsFilter === "no_views" && asset.views > 0) return false;
        return true;
      })
      .sort((a, b) => b.views - a.views || a.title.localeCompare(b.title));
  }, [assetsQuery.data, viewsByAssetId, viewsFilter]);

  const hasActiveFilters =
    search.trim() !== "" ||
    format !== ALL ||
    pillar !== ALL ||
    locale !== ALL ||
    viewsFilter !== ALL;

  const resetFilters = () => {
    setSearch("");
    setFormat(ALL);
    setPillar(ALL);
    setLocale(ALL);
    setViewsFilter(ALL);
  };

  const isLoading =
    assetsQuery.isLoading ||
    engagementsQuery.isLoading ||
    assetsQuery.isFetching;
  const IS_RTL = i18n.language === "ar";

  return (
    <Page
      classes={`hosn-resources ${IS_RTL ? "hosn-resources--rtl" : ""}`}
      heading={t("heading")}
      showGoBackArrow={false}
    >
      <Block>
        <div className="hosn-resources__filters">
          <InputSearch
            placeholder={t("search")}
            value={search}
            onChange={setSearch}
            classes="hosn-resources__search"
          />

          <div className="hosn-resources__filter-row">
            <DropdownWithLabel
              label={t("format")}
              selected={format}
              setSelected={setFormat}
              options={formatOptions}
              classes="hosn-resources__filter"
            />
            <DropdownWithLabel
              label={t("pillar")}
              selected={pillar}
              setSelected={setPillar}
              options={pillarOptions}
              classes="hosn-resources__filter"
            />
            <DropdownWithLabel
              label={t("locale")}
              selected={locale}
              setSelected={setLocale}
              options={localeOptions}
              classes="hosn-resources__filter"
            />
            <DropdownWithLabel
              label={t("views")}
              selected={viewsFilter}
              setSelected={setViewsFilter}
              options={viewsOptions}
              classes="hosn-resources__filter"
            />
            {hasActiveFilters && (
              <Button
                type="secondary"
                size="sm"
                label={t("reset")}
                onClick={resetFilters}
                classes="hosn-resources__reset"
              />
            )}
          </div>
        </div>

        {isLoading ? (
          <Loading size="lg" />
        ) : rows.length === 0 ? (
          <p className="hosn-resources__empty">{t("no_data")}</p>
        ) : (
          <>
            <p className="hosn-resources__count">
              {t("results_count", { count: rows.length })}
            </p>
            <div className="hosn-resources__table-wrap">
              <table className="hosn-resources__table">
                <thead>
                  <tr>
                    <th>{t("title")}</th>
                    <th>{t("format")}</th>
                    <th>{t("pillar")}</th>
                    <th>{t("locale")}</th>
                    <th className="hosn-resources__num">{t("views")}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((asset) => (
                    <tr key={asset.id}>
                      <td>{asset.title}</td>
                      <td>
                        {t(`format_${asset.format}`, {
                          defaultValue: asset.format,
                        })}
                      </td>
                      <td>{asset.pillarName || asset.pillarKey || "—"}</td>
                      <td>
                        {asset.locale
                          ? t(`locale_${asset.locale}`, {
                              defaultValue: asset.locale.toUpperCase(),
                            })
                          : "—"}
                      </td>
                      <td className="hosn-resources__num">{asset.views}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Block>
    </Page>
  );
};
