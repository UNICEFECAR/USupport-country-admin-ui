import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Page, ArticleView } from "#blocks";
import { destructureArticleData } from "@USupport-components-library/utils";
import { Loading } from "@USupport-components-library/src";

import { cmsSvc, userSvc } from "@USupport-components-library/services";

import "./article-information.scss";

/**
 * ArticleInformation
 *
 * ArticleInformation Page
 *
 * @returns {JSX.Element}
 */
export const ArticleInformation = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { i18n, t } = useTranslation("article-information-page");

  const getArticleData = async () => {
    let articleIdToFetch = id;

    const contentRatings = await userSvc.getRatingsForContent({
      contentType: "article",
      contentId: articleIdToFetch,
    });

    const { data } = await cmsSvc.getArticleById(
      articleIdToFetch,
      i18n.language
    );

    const finalData = destructureArticleData(data);
    finalData.contentRating = contentRatings.data;
    return finalData;
  };

  const { data: articleData, isLoading: isArticleDataLoading } = useQuery(
    ["article", i18n.language, id],
    getArticleData,
    {
      enabled: !!id,
    }
  );
  return (
    <Page
      classes="page__article-information"
      heading={t("heading")}
      handleGoBack={() =>
        navigate(
          `/country-admin/${localStorage.getItem(
            "language"
          )}/content-management?tab=articles`
        )
      }
    >
      {articleData && <ArticleView articleData={articleData} t={t} />}
      {!articleData && isArticleDataLoading && <Loading />}
    </Page>
  );
};
