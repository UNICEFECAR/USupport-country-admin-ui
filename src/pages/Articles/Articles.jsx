import React from "react";
import { Page, Articles as ArticlesBlock } from "#blocks";
import { useTranslation } from "react-i18next";

/**
 * Articles
 *
 * Articles Page
 *
 * @returns {JSX.Element}
 */
export const Articles = () => {
  const { t } = useTranslation("pages", { keyPrefix: "articles-page" });

  return (
    <Page
      classes="page__articles"
      heading={t("heading")}
      showGoBackArrow={false}
    >
      <ArticlesBlock />
    </Page>
  );
};
