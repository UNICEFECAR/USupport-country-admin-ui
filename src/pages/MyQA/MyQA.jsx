import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { ButtonWithIcon } from "@USupport-components-library/src";
import { Page, MyQA as MyQABlock } from "#blocks";

import "./my-qa.scss";

/**
 * MyQA
 *
 * MyQA page
 *
 * @returns {JSX.Element}
 */
export const MyQA = () => {
  const [isFilterButtonShown, setIsFilterButtonShown] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { t } = useTranslation("pages", { keyPrefix: "my-qa-page" });
  return (
    <Page classes="page__my-qa" showGoBackArrow={false} heading={t("heading")}>
      <MyQABlock
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        isFilterButtonShown={isFilterButtonShown}
        setIsFilterButtonShown={setIsFilterButtonShown}
      />
    </Page>
  );
};
