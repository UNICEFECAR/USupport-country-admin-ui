import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  useCustomNavigate as useNavigate,
  useGetActiveCountriesArticles,
} from "#hooks";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { articlePlaceholder } from "@USupport-components-library/assets";
import {
  filterAdminData,
  getDateView,
} from "@USupport-components-library/utils";

import { useError } from "#hooks";

import "./articles.scss";

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

  const [languageOfData, setLanguageOfData] = useState(i18n.language);
  const [error, setError] = useState();
  const [dataToDisplay, setDataToDisplay] = useState([]);
  // const [numberOfArticles, setNumberOfArticles] = useState();
  const [hasMore, setHasMore] = useState(true);
  const [startFrom, setStartFrom] = useState(0);

  const [articleIds, setArticleIds] = useState([]);
  const [selectedCountryFilter, setSelectedCountryFilter] = useState("");

  const { data: activeCountriesArticles } = useGetActiveCountriesArticles();

  const getCountriesForArticle = useCallback(
    (article) => {
      if (!Array.isArray(activeCountriesArticles)) return [];
      const idsSet = new Set([
        String(article.id),
        ...(article.localizations?.data?.map((loc) => String(loc.id)) || []),
      ]);
      return activeCountriesArticles
        .filter((c) =>
          (c.article_ids || []).some((id) => idsSet.has(String(id)))
        )
        .map((c) => ({ alpha2: c.alpha2, name: c.name || c.alpha2 }));
    },
    [activeCountriesArticles]
  );

  const filteredData = useMemo(() => {
    if (!selectedCountryFilter) return dataToDisplay;
    return dataToDisplay.filter((article) =>
      getCountriesForArticle(article).some(
        (c) => c.alpha2 === selectedCountryFilter
      )
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
    [activeCountriesArticles, t]
  );

  useEffect(() => {
    if (i18n.language !== languageOfData) {
      setLanguageOfData(i18n.language);
      setDataToDisplay([]);
      setStartFrom(0);
      setHasMore(true);
    }
  }, [i18n.language, languageOfData]);

  //--------------------- Articles ----------------------//
  const getArticles = async () => {
    let dbArticleIds = articleIds;

    if (dbArticleIds.length === 0 && Array.isArray(activeCountriesArticles)) {
      dbArticleIds = activeCountriesArticles
        .map((country) => country.article_ids || [])
        .flat()
        .filter(Boolean);
      setArticleIds(dbArticleIds);
    }

    let { data } = await cmsSvc.getArticles({
      locale: i18n.language,
      ids: dbArticleIds,
      isForAdmin: true,
      populate: true,
      startFrom: startFrom,
    });

    const numberOfArticles = data.meta.pagination.total;

    const filteredData = filterAdminData(data.data, data.meta.localizedIds);

    const formattedData = filteredData.map((x) => ({
      ...x.attributes,
      id: x.id,
      isSelected: !!x.isSelected,
      likes: Number(x.attributes.likes) || 0,
      dislikes: Number(x.attributes.dislikes) || 0,
    }));
    const newData = [...dataToDisplay, ...formattedData].filter(
      (x) => x.locale === i18n.language
    );
    setDataToDisplay(newData);

    return { formattedData, numberOfArticles };
  };

  const {
    isLoading: articlesLoading,
    isFetched: isArticlesFetched,
    isFetching: isArticlesFetching,
  } = useQuery(["articles", i18n.language, startFrom], getArticles, {
    onSuccess: (data) => {
      // setNumberOfArticles(data.numberOfArticles);
      if (hasMore) {
        setStartFrom((prev) => prev + data.formattedData.length);
      }
      const newData = [...dataToDisplay, ...data.formattedData].filter(
        (x) => x.locale === i18n.language
      );
      setDataToDisplay(newData);
      const newHasMore = data.numberOfArticles > dataToDisplay.length;
      setHasMore(newHasMore);
    },
  });

  const handleSelectArticle = async (id, newValue) => {
    let newData = JSON.parse(JSON.stringify(dataToDisplay));
    const index = newData.indexOf(newData.find((x) => x.id === id));
    newData[index].isSelected = newValue;
    setDataToDisplay(newData);

    let idToUse = id;

    if (newValue === false) {
      if (!articleIds.includes(id)) {
        const currentData = dataToDisplay[index];
        const dataLocalizations = currentData.localizations.data;
        const articleIdToUse = dataLocalizations.find((x) =>
          articleIds.includes(x.id.toString())
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

  const updateArticles = async (data) => {
    const articleLocales = await cmsSvc.getArticleLocales(data.id);
    const currentLang = i18n.language;

    if (data.newValue === true) {
      const newDataId = articleLocales[currentLang].toString();
      await adminSvc.putArticle(newDataId);
      setArticleIds([...articleIds, newDataId]);
    } else {
      await adminSvc.deleteArticle(data.id.toString());
      setArticleIds(articleIds.filter((x) => x !== data.id));
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
        (x) => x.sortingKey !== "likes" && x.sortingKey !== "dislikes"
      );
    }

    return columns;
  }, [i18n.language, t, IS_PS]);

  const [searchValue, setSearchValue] = useState("");

  const rowsData = useCallback(() => {
    return filteredData?.map((article) => {
      if (searchValue) {
        const search = searchValue.toLowerCase();
        const date = getDateView(new Date(article.createdAt)).toString();
        const category = article.category?.data?.attributes.name?.toLowerCase();
        const labels = article.labels?.data?.map((x) =>
          x.attributes.Name?.toLowerCase()
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
  }, [filteredData, searchValue, IS_PS, getCountriesForArticle, t, navigate]);

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
              noteText={t("note")}
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
