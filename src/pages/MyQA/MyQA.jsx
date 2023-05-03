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

  const { t } = useTranslation("my-qa-page");
  return (
    <Page
      classes="page__my-qa"
      showGoBackArrow={false}
      heading={t("heading")}
      headingButton={
        isFilterButtonShown ? (
          <ButtonWithIcon
            type="primary"
            label={t("filter")}
            iconName="filter"
            iconColor="#ffffff"
            iconSize="sm"
            color="purple"
            size="sm"
            onClick={() => setIsFilterOpen(true)}
            classes="page__my-qa__filter-button"
          />
        ) : null
      }
    >
      <MyQABlock
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        isFilterButtonShown={isFilterButtonShown}
        setIsFilterButtonShown={setIsFilterButtonShown}
      />
    </Page>
  );
};
