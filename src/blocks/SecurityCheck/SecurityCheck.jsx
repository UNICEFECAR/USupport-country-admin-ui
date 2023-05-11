import React, { useState } from "react";
import {
  Block,
  Button,
  SecurityCheckReport,
  Loading,
} from "@USupport-components-library/src";

import { useGetSecurityChecks } from "#hooks";

import "./security-check.scss";
import { useTranslation } from "react-i18next";
import { FilterSecurityCheckReports } from "../../backdrops/FilterSecurityCheckReports/FilterSecurityCheckReports";
import { useMemo } from "react";

/**
 * SecurityCheck
 *
 * Security check report block
 *
 * @return {jsx}
 */
export const SecurityCheck = ({ Heading }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { t } = useTranslation("security-check");
  const { data: securityChecks, isLoading } = useGetSecurityChecks();
  const [filters, setFilters] = useState({});

  const changeFilter = (filterData) => {
    setFilters(filterData);
  };

  const filterSecurityChecks = (securityCheck) => {
    const isProviderIdMatching = filters.provider
      ? securityCheck.providerDetailId === filters.provider
      : true;

    const isNumberOfIssuesMatching = filters.numberOfIssues
      ? securityCheck.numberOfIssues >= filters.numberOfIssues
      : true;

    const isStartingDateMatching = filters.startingDate
      ? new Date(securityCheck.consultationTime) >=
        new Date(filters.startingDate)
      : true;

    return isProviderIdMatching &&
      isNumberOfIssuesMatching &&
      isStartingDateMatching
      ? securityCheck
      : false;
  };

  const renderSecurityChecks = useMemo(() => {
    if (!securityChecks) return null;

    const filteredSecurityChecks = securityChecks
      .sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      })
      .filter(filterSecurityChecks);
    if (filteredSecurityChecks.length === 0)
      return (
        <p className="paragraph security-check__no-results">
          {t("no_results")}
        </p>
      );

    return filteredSecurityChecks.map((securityCheck, index) => {
      return (
        <SecurityCheckReport securityCheck={securityCheck} t={t} key={index} />
      );
    });
  }, [securityChecks, filters]);

  const providerDetails = useMemo(() => {
    if (securityChecks) {
      const providerIds = Array.from(
        new Set(securityChecks.map((x) => x.providerDetailId))
      );
      const providers = providerIds.map((providerId) => {
        const details = securityChecks.find(
          (x) => x.providerDetailId === providerId
        );
        return {
          providerDetailId: details.providerDetailId,
          providerName: details.providerName,
        };
      });
      return providers;
    }
    return null;
  }, [securityChecks]);

  return (
    <Block classes="security-check">
      <Heading
        headingLabel={t("heading")}
        handleButtonClick={() => setIsFilterOpen(true)}
      />

      {isLoading ? (
        <Loading size="lg" />
      ) : securityChecks.length === 0 ? (
        <p className="paragraph security-check__no-results">
          {t("no_results")}
        </p>
      ) : (
        renderSecurityChecks
      )}
      <FilterSecurityCheckReports
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        changeFilter={changeFilter}
        data={providerDetails}
      />
    </Block>
  );
};
