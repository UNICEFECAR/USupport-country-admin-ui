import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { Page } from "#blocks";
import { NotFound as NotFoundBlock } from "@USupport-components-library/src";
/**
 * NotFound
 *
 * NotFound page.
 *
 * @returns {JSX.Element}
 */
export const NotFound = () => {
  const { t } = useTranslation("not-found-page");
  const navigate = useNavigate();
  const language = localStorage.getItem("language") || "en";

  return (
    <Page showGoBackArrow={false}>
      <NotFoundBlock
        headingText={t("heading")}
        subheadingText={t("subheading")}
        buttonText={t("button")}
        handleClick={() => {
          navigate(`/country-admin/${language}`);
        }}
      />
    </Page>
  );
};
