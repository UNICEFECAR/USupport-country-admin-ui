import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  useCustomNavigate as useNavigate,
  useGetActiveCountriesArticles,
  useCountryPinnedArticles,
  useCountryAdminArticlesPaginated,
  COUNTRY_PINNED_ARTICLES_QUERY_KEY,
} from "#hooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import {
  Block,
  Button,
  Grid,
  GridItem,
  CheckBox,
  Loading,
  Error as ErrorComponent,
  BaseTable,
  InputSearch,
  DropdownWithLabel,
} from "@USupport-components-library/src";

import { cmsSvc, adminSvc } from "@USupport-components-library/services";
import { getDateView } from "@USupport-components-library/utils";
import { articlePlaceholder } from "@USupport-components-library/assets";



import { useError } from "#hooks";

import "./articles.scss";

/**
 * Persist the same stable Strapi entry id whenever an article exists in EN.
 * `country.article_ids` / `pinned_articles` are varchar CMS ids — mixing locales breaks client intersection.
 *
 * @param {Record<string, number|string>} articleLocalesPayload - from CMS getArticleLocales
 * @returns {string|null}
 */
const getCanonicalStrapiArticleIdForCountry = (articleLocalesPayload) => {
  if (!articleLocalesPayload || typeof articleLocalesPayload !== "object") {
    return null;
  }
  const enVal = articleLocalesPayload.en;
  if (enVal != null && enVal !== "") {
    return String(enVal).trim();
  }
  const firstNonEmpty = Object.values(articleLocalesPayload).find(
    (v) => v != null && String(v).trim() !== "",
  );
  return firstNonEmpty != null ? String(firstNonEmpty).trim() : null;
};

/**
 * Pinned rows use canonical EN ids; the table shows the current-locale id only.
 * Uses row localizations when present, and `meta.availableLocales` from the CMS list response.
 *
 * @param {object} article
 * @param {string|number} pinnedId
 * @param {Record<string, Record<string, number|string>>|null|undefined} localeMeta
 */
const articleRowMatchesPinnedArticleId = (article, pinnedId, localeMeta) => {
  const p = String(pinnedId).trim();
  if (!p) return false;

  const rowIds = new Set([
    String(article.id),
    ...(article.localizations?.data?.map((loc) => String(loc.id)) || []),
  ]);
  if (rowIds.has(p)) return true;

  if (!localeMeta || typeof localeMeta !== "object") return false;

  for (const locMap of Object.values(localeMeta)) {
    if (!locMap || typeof locMap !== "object") continue;
    const cluster = [
      ...new Set(
        Object.values(locMap)
          .filter((v) => v != null && v !== "")
          .map((v) => String(v).trim()),
      ),
    ];
    if (!cluster.includes(p)) continue;
    if (cluster.some((cid) => rowIds.has(cid))) return true;
  }
  return false;
};

/**
 * Articles
 *
 * Articles Block
 *
 * @return {jsx}
 */
export const Articles = () => {
  const queryClient = useQueryClient();
  const { i18n, t } = useTranslation("blocks", { keyPrefix: "articles" });
  const navigate = useNavigate();

  const IS_PS = localStorage.getItem("country") === "PS";
  const SHOW_PINNED_ARTICLES =
    localStorage.getItem("country")?.toUpperCase() === "RO";

  const [languageOfData, setLanguageOfData] = useState(i18n.language);
  const [error, setError] = useState();
  const [dataToDisplay, setDataToDisplay] = useState([]);
  // const [numberOfArticles, setNumberOfArticles] = useState();
  const [hasMore, setHasMore] = useState(true);
  const [startFrom, setStartFrom] = useState(0);

  const [articleIds, setArticleIds] = useState([]);
  /** Built from CMS `meta.availableLocales` on each batched GET (ids + locale clustering). */
  const [articleLocaleMetaByList, setArticleLocaleMetaByList] = useState({});
  const [selectedCountryFilter, setSelectedCountryFilter] = useState("");

  const { data: activeCountriesArticles, isFetched: activeCountriesIndexFetched } =
    useGetActiveCountriesArticles();

  /** Wait for `/active-countries-articles` so `ids=` matches THIS country's pool (correct checkboxes). */
  const storageCountryAlpha2 = localStorage.getItem("country") ?? "";
  const getCountriesForArticle = useCallback(
    (article) => {
      if (!Array.isArray(activeCountriesArticles)) return [];
      const idsSet = new Set([
        String(article.id),
        ...(article.localizations?.data?.map((loc) => String(loc.id)) || []),
      ]);
      return activeCountriesArticles
        .filter((c) =>
          (c.article_ids || []).some((id) => idsSet.has(String(id))),
        )
        .map((c) => ({ alpha2: c.alpha2, name: c.name || c.alpha2 }));
    },
    [activeCountriesArticles],
  );

  const filteredData = useMemo(() => {
    if (!selectedCountryFilter) return dataToDisplay;
    return dataToDisplay.filter((article) =>
      getCountriesForArticle(article).some(
        (c) => c.alpha2 === selectedCountryFilter,
      ),
    );
  }, [dataToDisplay, selectedCountryFilter, getCountriesForArticle]);

  const countryFilterOptions = useMemo(
    () => [
      { value: "", label: t("all_countries") },
      ...(activeCountriesArticles || []).map((c) => ({
        value: c.alpha2,
        label: c.name || c.alpha2,
      })),
    ],
    [activeCountriesArticles, t],
  );

  const {
    data: pinnedArticlesPayload,
    isFetched: pinnedArticlesFetched,
    isLoading: pinnedArticlesListInitialLoading,
  } = useCountryPinnedArticles(SHOW_PINNED_ARTICLES);

  const pinnedArticleIds = useMemo(() => {
    if (!Array.isArray(pinnedArticlesPayload)) return [];
    return pinnedArticlesPayload.map((id) => String(id));
  }, [pinnedArticlesPayload]);

  const articleIsPinned = useCallback(
    (article) =>
      pinnedArticleIds.some((pid) =>
        articleRowMatchesPinnedArticleId(article, pid, articleLocaleMetaByList),
      ),
    [pinnedArticleIds, articleLocaleMetaByList],
  );

  useEffect(() => {
    if (i18n.language !== languageOfData) {
      setLanguageOfData(i18n.language);
      setDataToDisplay([]);
      setArticleLocaleMetaByList({});
      setStartFrom(0);
      setHasMore(true);
    }
  }, [i18n.language, languageOfData]);

  //--------------------- Articles ----------------------//
  const {
    isLoading: articlesLoading,
    isFetched: isArticlesFetched,
    isFetching: isArticlesFetching,
  } = useCountryAdminArticlesPaginated({
    locale: i18n.language,
    startFrom,
    articleIds,
    setArticleIds,
    activeCountriesIndexReady: activeCountriesIndexFetched,
    countryAlpha2: storageCountryAlpha2,
    activeCountriesArticles,
    setArticleLocaleMetaByList,
    dataToDisplay,
    setDataToDisplay,
    hasMore,
    setHasMore,
    setStartFrom,
  });

  const handleSelectArticle = async (id, newValue) => {
    let newData = JSON.parse(JSON.stringify(dataToDisplay));
    const index = newData.indexOf(newData.find((x) => x.id === id));
    newData[index].isSelected = newValue;
    setDataToDisplay(newData);

    let idToUse = id;

    if (newValue === false) {
      if (!articleIds.some((x) => String(x).trim() === String(id).trim())) {
        const currentData = dataToDisplay[index];
        const dataLocalizations = currentData.localizations.data;
        const articleIdToUse = dataLocalizations.find((x) =>
          articleIds.some(
            (poolId) =>
              String(poolId).trim() === String(x.id).trim(),
          ),
        );
        if (articleIdToUse) {
          idToUse = articleIdToUse.id;
        }
      }
    }

    updateArticlesMutation.mutate({
      id: idToUse.toString(),
      newValue,
      articleData: newData,
    });
  };

  const updatePinnedArticles = async ({ articleRowId, newValue }) => {
    const articleLocales = await cmsSvc.getArticleLocales(articleRowId);
    const uiLang =
      typeof i18n.language === "string" ? i18n.language.split("-")[0] : "";
    const canonicalId =
      getCanonicalStrapiArticleIdForCountry(articleLocales) ??
      articleLocales?.[i18n.language]?.toString() ??
      (uiLang ? articleLocales?.[uiLang]?.toString() : undefined);
    if (!canonicalId) {
      throw new Error("Could not resolve article id for pinning");
    }
    if (newValue === true) {
      await adminSvc.putPinnedArticle(canonicalId);
    } else {
      await adminSvc.deletePinnedArticle(canonicalId);
    }
    return newValue;
  };

  const updatePinnedMutation = useMutation(updatePinnedArticles, {
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: COUNTRY_PINNED_ARTICLES_QUERY_KEY,
      });
      toast(t(variables.successToastKey));
    },
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      setError(errorMessage);
    },
  });

  const handleTogglePinnedArticle = (article, newPinnedValue) => {
    if (
      SHOW_PINNED_ARTICLES !== true ||
      pinnedArticlesFetched !== true ||
      updatePinnedMutation.isLoading
    ) {
      return;
    }
    if (!article.isSelected && newPinnedValue === true) {
      return;
    }
    updatePinnedMutation.mutate({
      articleRowId: article.id,
      newValue: newPinnedValue,
      successToastKey: newPinnedValue ? "article_pinned" : "article_unpinned",
    });
  };

  const updateArticles = async (data) => {
    const articleLocales = await cmsSvc.getArticleLocales(data.id);
    const currentLang = i18n.language;

    if (!data.newValue && SHOW_PINNED_ARTICLES) {
      const pinnedCached = queryClient.getQueryData(
        COUNTRY_PINNED_ARTICLES_QUERY_KEY,
      );
      const pinnedList = Array.isArray(pinnedCached)
        ? pinnedCached.map((x) => String(x))
        : [];
      const clusterIds = new Set([
        String(data.id),
        ...Object.values(articleLocales).map((x) => String(x)),
      ]);
      const pinnedMember = pinnedList.find((pid) => clusterIds.has(pid));
      if (pinnedMember) {
        await adminSvc.deletePinnedArticle(pinnedMember);
      }
    }

    if (data.newValue === true) {
      const newDataId =
        getCanonicalStrapiArticleIdForCountry(articleLocales) ??
        articleLocales?.[currentLang]?.toString();
      if (!newDataId) {
        throw new Error("Could not resolve article id");
      }
      await adminSvc.putArticle(newDataId);
      setArticleIds([...articleIds, newDataId]);
    } else {
      const canonical =
        getCanonicalStrapiArticleIdForCountry(articleLocales) ??
        String(data.id).trim();

      await adminSvc.deleteArticle(canonical);

      const localizationIdsToStrip = new Set(
        Object.values(articleLocales || {}).map((v) => String(v).trim()),
      );
      localizationIdsToStrip.add(String(data.id).trim());

      setArticleIds((prev) =>
        prev.filter((x) => !localizationIdsToStrip.has(String(x).trim())),
      );
    }

    return data.newValue;
  };

  const updateArticlesMutation = useMutation(updateArticles, {
    onMutate: (data) => {
      const oldData = queryClient.getQueryData(["articles", i18n.language]);

      // Perform an optimistic update to the UI
      queryClient.setQueryData(["articles", i18n.language], data.articleData);

      return () => {
        queryClient.setQueryData(["articles", i18n.language], oldData);
      };
    },
    onSuccess: (isAdding) => {
      toast(t(isAdding ? "article_added" : "article_removed"));
      if (SHOW_PINNED_ARTICLES) {
        queryClient.invalidateQueries({
          queryKey: COUNTRY_PINNED_ARTICLES_QUERY_KEY,
        });
      }
    },
    onError: (error, variables, rollback) => {
      const { message: errorMessage } = useError(error);
      setError(errorMessage);
      rollback();
    },
  });

  const rows = useMemo(() => {
    let columns = [
      {
        label: t("published"),
        sortingKey: "isSelected",
        isCentered: true,
      },
      ...(SHOW_PINNED_ARTICLES
        ? [
            {
              label: t("pinned"),
              isCentered: true,
            },
          ]
        : []),
      {
        label: t("image"),
        isCentered: true,
      },
      {
        label: t("content"),
        sortingKey: "title",
      },
      {
        label: t("views"),
        sortingKey: "read_count",
        isCentered: true,
        isNumbered: true,
      },
      {
        label: t("likes"),
        sortingKey: "likes",
        isCentered: true,
        isNumbered: true,
      },
      {
        label: t("dislikes"),
        sortingKey: "dislikes",
        isCentered: true,
        isNumbered: true,
      },
      {
        label: t("created_at"),
        sortingKey: "createdAt",
        isDate: true,
      },
      {
        label: t("countries"),
        isCentered: true,
      },
      {
        label: t("view"),
        isCentered: true,
      },
    ];

    if (IS_PS) {
      columns = columns.filter(
        (x) => x.sortingKey !== "likes" && x.sortingKey !== "dislikes",
      );
    }

    return columns;
  }, [SHOW_PINNED_ARTICLES, IS_PS, i18n.language, t]);

  const [searchValue, setSearchValue] = useState("");

  const rowsData = useCallback(() => {
    return filteredData?.map((article) => {
      const isPinnedForRow = articleIsPinned(article);
      const isPinMutationInFlightForThisRow =
        updatePinnedMutation.isLoading === true &&
        updatePinnedMutation.variables?.articleRowId === article.id;
      const showPinnedColumnLoader =
        SHOW_PINNED_ARTICLES === true &&
        (pinnedArticlesListInitialLoading === true ||
          isPinMutationInFlightForThisRow === true);

      if (searchValue) {
        const search = searchValue.toLowerCase();
        const date = getDateView(new Date(article.createdAt)).toString();
        const category = article.category?.data?.attributes.name?.toLowerCase();
        const labels = article.labels?.data?.map((x) =>
          x.attributes.Name?.toLowerCase(),
        );

        if (
          !article.title?.toLowerCase().includes(search) &&
          !article.description?.toLowerCase().includes(search) &&
          !date?.includes(search) &&
          !category?.includes(search) &&
          !labels?.some((x) => {
            return x?.includes(search);
          })
        ) {
          return null;
        }
      }

      return [
        <CheckBox
          isChecked={article.isSelected}
          setIsChecked={() =>
            handleSelectArticle(article.id, !article.isSelected)
          }
        />,
        ...(SHOW_PINNED_ARTICLES
          ? [
              showPinnedColumnLoader ? (
                <div className="articles__pinned-cell-loader" aria-busy="true">
                  <Loading
                    size="sm"
                    padding="0"
                    height="2.25rem"
                    margin="0 auto"
                  />
                </div>
              ) : (
                <CheckBox
                  isChecked={isPinnedForRow}
                  disabled={
                    pinnedArticlesFetched !== true ||
                    (!article.isSelected && !isPinnedForRow)
                  }
                  setIsChecked={() =>
                    handleTogglePinnedArticle(article, !isPinnedForRow)
                  }
                />
              ),
            ]
          : []),
        <img
          className="articles__image"
          src={
            article.image?.data?.attributes?.formats?.medium?.url ||
            article.image?.data?.attributes?.formats?.small?.url ||
            article.image?.data?.attributes?.formats?.thumbnail?.url ||
            article.image?.data?.attributes?.formats?.large?.url ||
            articlePlaceholder
          }
        />,
        <div>
          <p className="articles__heading">{article.title}</p>
          <p className="text articles__description">{article.description}</p>
        </div>,
        <p className="text centered">{article.read_count || 0}</p>,
        IS_PS ? null : <p className="text centered">{article.likes || 0}</p>,
        IS_PS ? null : <p className="text centered">{article.dislikes || 0}</p>,
        <div>{getDateView(new Date(article.createdAt))}</div>,
        (() => {
          const countries = getCountriesForArticle(article);
          const names = countries.map((c) => c.name).join(", ");
          return (
            <div className="articles__countries" title={names}>
              {names || "—"}
            </div>
          );
        })(),
        <Button
          label={t("view_button")}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/article/${article.id}`);
          }}
        />,
      ].filter((x) => x !== null);
    });
  }, [
    filteredData,
    searchValue,
    IS_PS,
    SHOW_PINNED_ARTICLES,
    pinnedArticlesFetched,
    pinnedArticlesListInitialLoading,
    articleIsPinned,
    updatePinnedMutation.isLoading,
    updatePinnedMutation.variables,
    getCountriesForArticle,
    t,
    navigate,
  ]);

  return (
    <Block classes="articles">
      <Grid>
        <GridItem md={8} lg={12}>
          <div className="articles__filters">
            <InputSearch
              value={searchValue}
              onChange={(val) => setSearchValue(val)}
              placeholder={t("search")}
              classes="articles__search"
            />
            <DropdownWithLabel
              label={t("filter_by_country")}
              selected={selectedCountryFilter}
              setSelected={setSelectedCountryFilter}
              options={countryFilterOptions}
              classes="articles__country-filter"
            />
          </div>
        </GridItem>
        <GridItem md={8} lg={12} classes="articles__rows">
          {dataToDisplay.length > 0 &&
          (filteredData.length > 0 || !selectedCountryFilter) ? (
            <BaseTable
              data={filteredData || []}
              rows={rows}
              rowsData={rowsData()}
              updateData={setDataToDisplay}
              t={t}
              hasMenu={false}
              noteText={
                SHOW_PINNED_ARTICLES ? t("note_with_pinned") : t("note")
              }
            />
          ) : null}
          {!dataToDisplay.length && articlesLoading && <Loading />}
          {!dataToDisplay.length &&
            !articlesLoading &&
            isArticlesFetched &&
            !isArticlesFetching && (
              <h3 className="articles__no-results">{t("no_results")}</h3>
            )}
          {dataToDisplay.length > 0 &&
            selectedCountryFilter &&
            filteredData.length === 0 && (
              <h3 className="articles__no-results">
                {t("no_articles_for_country")}
              </h3>
            )}
          {error ? <ErrorComponent message={error} /> : null}
        </GridItem>
      </Grid>
    </Block>
  );
};
