import React from "react";
import { useTranslation } from "react-i18next";

import {
  Block,
  SecurityCheckReport,
  Loading,
} from "@USupport-components-library/src";

import { useGetSecurityChecks } from "#hooks";

import "./reports.scss";

/**
 * Reports
 *
 * Reports block
 *
 * @return {jsx}
 */
export const Reports = () => {
  const { t } = useTranslation("reports");
  const { data: securityChecks, isLoading } = useGetSecurityChecks();

  return (
    <Block classes="reports">
      {isLoading ? (
        <Loading size="lg" />
      ) : (
        securityChecks.map((securityCheck, index) => {
          return (
            <SecurityCheckReport
              securityCheck={securityCheck}
              t={t}
              key={index}
            />
          );
        })
      )}
    </Block>
  );
};
