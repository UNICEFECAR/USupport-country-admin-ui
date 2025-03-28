import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const { i18n, t } = useTranslation("articles");
  const navigate = useNavigate();

  const [languageOfData, setLanguageOfData] = useState(i18n.language);
  const [error, setError] = useState();
  const [dataToDisplay, setDataToDisplay] = useState([]);
  // const [numberOfArticles, setNumberOfArticles] = useState();
  const [hasMore, setHasMore] = useState(true);
  const [startFrom, setStartFrom] = useState(0);

  const [articleIds, setArticleIds] = useState([]);

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
    // Request Articles ids from the master DB
    let dbArticleIds = [];
    if (articleIds.length === 0) {
      dbArticleIds = await adminSvc.getArticles();
      setArticleIds(dbArticleIds);
    } else {
      dbArticleIds = articleIds;
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
    }));
    setDataToDisplay((prev) => [...prev, ...formattedData]);

    return { formattedData, numberOfArticles };
  };

  const { isLoading: articlesLoading, isFetched: isArticlesFetched } = useQuery(
    ["articles", i18n.language, startFrom],
    getArticles,
    {
      onSuccess: (data) => {
        // setNumberOfArticles(data.numberOfArticles);
        if (hasMore) {
          setStartFrom((prev) => prev + data.formattedData.length);
        }
        setDataToDisplay([...dataToDisplay, ...data.formattedData]);
        const newHasMore = data.numberOfArticles > dataToDisplay.length;
        setHasMore(newHasMore);
      },
    }
  );

  const handleSelectArticle = async (id, newValue) => {
    let newData = JSON.parse(JSON.stringify(dataToDisplay));
    const index = newData.indexOf(newData.find((x) => x.id === id));
    newData[index].isSelected = newValue;
    setDataToDisplay(newData);

    updateArticlesMutation.mutate({
      id: id.toString(),
      newValue,
      articleData: newData,
    });
  };

  const updateArticles = async (data) => {
    const articleLocales = await cmsSvc.getArticleLocales(data.id);
    const currentLang = i18n.language;

    if (data.newValue === true) {
      await adminSvc.putArticle(articleLocales[currentLang].toString());
    } else {
      await adminSvc.deleteArticle(articleLocales[currentLang].toString());
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
    return [
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
        label: t("created_at"),
        sortingKey: "createdAt",
        isDate: true,
      },
      {
        label: t("view"),
        isCentered: true,
      },
    ];
  }, []);

  const [searchValue, setSearchValue] = useState("");
  const rowsData = useCallback(() => {
    return dataToDisplay?.map((article) => {
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
          <p className="text">{article.description}</p>
        </div>,
        <div>{getDateView(new Date(article.createdAt))}</div>,
        <Button
          label={t("view_button")}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/article/${article.id}`);
          }}
        />,
      ];
    });
  }, [dataToDisplay, searchValue]);

  return (
    <Block classes="articles">
      <Grid>
        <GridItem>
          <InputSearch
            value={searchValue}
            onChange={(val) => setSearchValue(val)}
            placeholder={t("search")}
            classes="articles__search"
          />
        </GridItem>
        <GridItem md={8} lg={12} classes="articles__rows">
          {dataToDisplay.length ? (
            <BaseTable
              data={dataToDisplay || []}
              rows={rows}
              rowsData={rowsData()}
              updateData={setDataToDisplay}
              t={t}
              hasMenu={false}
              noteText={t("note")}
            />
          ) : null}
          {!dataToDisplay.length && articlesLoading && <Loading />}
          {!dataToDisplay.length && !articlesLoading && isArticlesFetched && (
            <h3 className="articles__no-results">{t("no_results")}</h3>
          )}
          {error ? <ErrorComponent message={error} /> : null}
        </GridItem>
      </Grid>
    </Block>
  );
};
