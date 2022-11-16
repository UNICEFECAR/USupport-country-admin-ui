import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Block,
  Grid,
  GridItem,
  ArticleRow,
  Loading,
  Error as ErrorComponent,
} from "@USupport-components-library/src";
import { useTranslation } from "react-i18next";

import { cmsSvc, adminSvc } from "@USupport-components-library/services";
import { filterAdminData } from "@USupport-components-library/utils";
import { useError } from "@USupport-components-library/hooks";

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

  const [error, setError] = useState();

  //--------------------- Articles ----------------------//
  const getArticles = async () => {
    // Request Articles ids from the master DB
    const articleIds = await adminSvc.getArticles();

    let { data } = await cmsSvc.getArticles({
      locale: i18n.language,
      ids: articleIds,
      isForAdmin: true,
    });

    console.log(data);

    const filteredData = filterAdminData(data.data, data.meta.localizedIds);

    return filteredData;
  };

  const {
    data: articlesData,
    isLoading: articlesLoading,
    isFetched: isArticlesFetched,
  } = useQuery(["articles", i18n.language], getArticles);

  const handleSelectArticle = async (id, newValue, index) => {
    let newData = JSON.parse(JSON.stringify(articlesData));
    newData[index].isSelected = newValue;

    updateArticlesMutation.mutate({
      id: id.toString(),
      newValue,
      articleData: newData,
    });
  };

  const updateArticles = async (data) => {
    const articleLocales = await cmsSvc.getArticleLocales(data.id);
    let res;
    if (data.newValue === true) {
      res = await adminSvc.putArticle(articleLocales.en.toString());
    } else {
      res = await adminSvc.deleteArticle(articleLocales.en.toString());
    }

    return res.data;
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
    onSuccess: (data) => {},
    onError: (error, variables, rollback) => {
      const { message: errorMessage } = useError(error);
      setError(errorMessage);
      rollback();
    },
  });

  return (
    <Block classes="articles">
      <Grid>
        <GridItem md={8} lg={12} classes="articles__rows">
          {isArticlesFetched &&
            articlesData &&
            articlesData.map((article, index) => {
              return (
                <ArticleRow
                  selected={article.isSelected}
                  setSelected={() =>
                    handleSelectArticle(article.id, !article.isSelected, index)
                  }
                  heading={article.attributes.title}
                  description={article.attributes.description}
                  key={index}
                />
              );
            })}
          {!articlesData?.length && articlesLoading && <Loading />}
          {!articlesData?.length && !articlesLoading && isArticlesFetched && (
            <h3 className="articles__no-results">{t("no_results")}</h3>
          )}
          {error ? <ErrorComponent message={error} /> : null}
        </GridItem>
      </Grid>
    </Block>
  );
};
