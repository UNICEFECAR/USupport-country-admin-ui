import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

import { Page } from "#blocks";
import {
  Block,
  InputSearch,
  Loading,
} from "@USupport-components-library/src";
import { adminSvc, cmsSvc } from "@USupport-components-library/services";

import "./hosn-resources.scss";

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

  const assetsQuery = useQuery(["hosn-assets-admin", "all"], async () => {
    const { data } = await cmsSvc.getHosnAssets({ locale: "all", limit: 500 });
    return mapCmsAssets(data?.data || []);
  });

  const engagementsQuery = useQuery(["hosnelhal-engagements"], () =>
    adminSvc.getHosnElHalEngagements().then((res) => res.data || [])
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
    const needle = search.trim().toLowerCase();
    return assets
      .map((asset) => ({
        ...asset,
        views: viewsByAssetId.get(Number(asset.id)) || 0,
      }))
      .filter((asset) => {
        if (!needle) return true;
        return (
          asset.title.toLowerCase().includes(needle) ||
          asset.format.toLowerCase().includes(needle) ||
          (asset.pillarName || "").toLowerCase().includes(needle) ||
          (asset.pillarKey || "").toLowerCase().includes(needle) ||
          asset.locale.toLowerCase().includes(needle)
        );
      })
      .sort((a, b) => b.views - a.views || a.title.localeCompare(b.title));
  }, [assetsQuery.data, viewsByAssetId, search]);

  const isLoading = assetsQuery.isLoading || engagementsQuery.isLoading;
  const IS_RTL = i18n.language === "ar";

  return (
    <Page
      classes={`hosn-resources ${IS_RTL ? "hosn-resources--rtl" : ""}`}
      heading={t("heading")}
      showGoBackArrow={false}
    >
      <Block>
        <InputSearch
          placeholder={t("search")}
          value={search}
          onChange={setSearch}
          classes="hosn-resources__search"
        />

        {isLoading ? (
          <Loading size="lg" />
        ) : rows.length === 0 ? (
          <p className="hosn-resources__empty">{t("no_data")}</p>
        ) : (
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
                    <td>{asset.locale || "—"}</td>
                    <td className="hosn-resources__num">{asset.views}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Block>
    </Page>
  );
};
