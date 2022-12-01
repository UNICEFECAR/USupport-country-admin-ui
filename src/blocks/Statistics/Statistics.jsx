import React from "react";
import { useTranslation } from "react-i18next";
import {
  Block,
  Grid,
  GridItem,
  Statistic,
  Loading,
} from "@USupport-components-library/src";
import { useWindowDimensions } from "@USupport-components-library/src/utils";
import { useGetStatistics } from "#hooks";

import "./statistics.scss";

/**
 * Statistics
 *
 * Statistics block
 *
 * @return {jsx}
 */
export const Statistics = () => {
  const countryId = localStorage.getItem("country_id");
  const { t } = useTranslation("statistics");
  const { width } = useWindowDimensions();
  const { isLoading, data: statistics } = useGetStatistics(countryId);

  const icons = {
    clients: "community",
    providers: "therapy",
    articles: "article",
    consultations: "live-consultation",
  };

  const renderAllStatistics = () => {
    return statistics.map((statistic, index) => {
      return (
        <GridItem
          md={4}
          lg={3}
          key={index}
          classes="statistics__statistics-item"
        >
          <Statistic
            textBold={statistic.value}
            text={t(statistic.type)}
            iconName={icons[statistic.type]}
            orientation={width > 768 ? "portrait" : "landscape"}
          />
        </GridItem>
      );
    });
  };

  return (
    <Block classes="statistics">
      <Grid md={8} lg={12}>
        <h4>{t("statistics")}: </h4>
      </Grid>
      <Grid md={8} lg={12} classes="statistics__statistics-grid">
        {isLoading ? <Loading size="lg" /> : renderAllStatistics()}
      </Grid>
    </Block>
  );
};
