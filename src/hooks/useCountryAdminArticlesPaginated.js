import { useQuery } from "@tanstack/react-query";

import { cmsSvc } from "@USupport-components-library/services";
import { filterAdminData } from "@USupport-components-library/utils";

/**
 * Normalize admin-storage country codes (e.g. "ro" vs "RO") for matching API rows.
 *
 * @param {string|null|undefined} alpha2
 */
export function normalizeAdminCountryAlpha2(alpha2) {
  if (!alpha2 || typeof alpha2 !== "string") return "";
  const t = alpha2.trim();
  if (!t) return "";
  return t.toUpperCase();
}

/**
 * Article ids persisted for the country admin subdomain (master DB pool for this CMS instance).
 *
 * @param {Array<{ alpha2?: string, article_ids?: unknown[] }> | null | undefined} activeCountriesArticles
 * @param {string} normalizedAlpha2 — from `normalizeAdminCountryAlpha2`
 */
export function getArticleIdsForAdminCountry(activeCountriesArticles, normalizedAlpha2) {
  if (!normalizedAlpha2 || normalizedAlpha2 === "GLOBAL") {
    if (!Array.isArray(activeCountriesArticles)) return [];
    return activeCountriesArticles
      .map((country) => country.article_ids || [])
      .flat()
      .filter((id) => id != null && String(id).trim() !== "")
      .map((id) => String(id).trim());
  }
  const row = (activeCountriesArticles ?? []).find(
    (c) => normalizeAdminCountryAlpha2(c.alpha2) === normalizedAlpha2,
  );
  return (row?.article_ids ?? [])
    .filter((id) => id != null && String(id).trim() !== "")
    .map((id) => String(id).trim());
}

/**
 * Infinite-style pagination via `startFrom` + accumulated table state (legacy pattern).
 *
 * @param {object} options
 * @param {string} options.locale — i18n language for CMS
 * @param {number} options.startFrom — pagination cursor
 * @param {string[]} options.articleIds — country article CMS ids tracked in UI state
 * @param {(ids: string[]) => void} options.setArticleIds
 * @param {boolean} options.activeCountriesIndexReady — active countries/articles index loaded
 * @param {string} options.countryAlpha2 — admin country from `localStorage` (scoped selection)
 * @param {Array<{ article_ids?: string[] }> | undefined | null} options.activeCountriesArticles
 * @param {(updater: (prev: Record<string, unknown>) => Record<string, unknown>) => void} options.setArticleLocaleMetaByList
 * @param {object[]} options.dataToDisplay — accumulated rows (for merging + empty check inside onSuccess)
 * @param {(rows: object[]) => void} options.setDataToDisplay
 * @param {boolean} options.hasMore
 * @param {(n: boolean) => void} options.setHasMore
 * @param {(fn: (n: number) => number) => void} options.setStartFrom
 */
export function useCountryAdminArticlesPaginated({
  locale,
  startFrom,
  articleIds,
  setArticleIds,
  activeCountriesIndexReady,
  countryAlpha2,
  activeCountriesArticles,
  setArticleLocaleMetaByList,
  dataToDisplay,
  setDataToDisplay,
  hasMore,
  setHasMore,
  setStartFrom,
}) {
  const countryNorm = normalizeAdminCountryAlpha2(countryAlpha2);

  const getArticles = async () => {
    let dbArticleIds = articleIds.length > 0 ? articleIds.slice() : [];

    if (
      dbArticleIds.length === 0 &&
      Array.isArray(activeCountriesArticles) &&
      activeCountriesIndexReady
    ) {
      dbArticleIds = getArticleIdsForAdminCountry(
        activeCountriesArticles,
        countryNorm,
      );
      setArticleIds(dbArticleIds);
    }

    let { data } = await cmsSvc.getArticles({
      locale,
      ids: dbArticleIds,
      isForAdmin: true,
      populate: true,
      startFrom,
    });

    const numberOfArticles = data.meta.pagination.total;

    const filteredData = filterAdminData(
      data.data,
      data.meta.localizedIds,
      data.meta.availableLocales,
    );

    if (
      data.meta?.availableLocales &&
      typeof data.meta.availableLocales === "object"
    ) {
      setArticleLocaleMetaByList((prev) => ({
        ...prev,
        ...data.meta.availableLocales,
      }));
    }

    const formattedData = filteredData.map((x) => ({
      ...x.attributes,
      id: x.id,
      isSelected: !!x.isSelected,
      likes: Number(x.attributes.likes) || 0,
      dislikes: Number(x.attributes.dislikes) || 0,
    }));
    const newData = [...dataToDisplay, ...formattedData].filter(
      (x) => x.locale === locale,
    );
    setDataToDisplay(newData);

    return { formattedData, numberOfArticles };
  };

  const query = useQuery(
    ["articles", locale, startFrom, countryNorm || "GLOBAL"],
    getArticles,
    {
      enabled: Boolean(activeCountriesIndexReady),
      onSuccess: (data) => {
        if (hasMore) {
          setStartFrom((prev) => prev + data.formattedData.length);
        }
        const newData = [...dataToDisplay, ...data.formattedData].filter(
          (x) => x.locale === locale,
        );
        setDataToDisplay(newData);
        const newHasMore = data.numberOfArticles > dataToDisplay.length;
        setHasMore(newHasMore);
      },
    },
  );

  return query;
}
