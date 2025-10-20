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
  const { t } = useTranslation("blocks", { keyPrefix: "statistics" });
  const { width } = useWindowDimensions();
  const { isLoading, data: statistics } = useGetStatistics(countryId);

  const data = {
    clients: { iconName: "community", tooltip: t("tooltip_clients") },
    providers: { iconName: "therapy", tooltip: t("tooltip_providers") },
    articles: { iconName: "article", tooltip: t("tooltip_articles") },
    consultations: {
      iconName: "live-consultation",
      tooltip: t("tooltip_consultations"),
    },
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
            iconName={data[statistic.type].iconName}
            orientation={width > 768 ? "portrait" : "landscape"}
            tooltip={data[statistic.type].tooltip}
          />
        </GridItem>
      );
    });
  };

  return (
    <Block classes="statistics">
      <Grid md={8} lg={12} classes="statistics__statistics-grid">
        {isLoading ? <Loading size="lg" /> : renderAllStatistics()}
      </Grid>
    </Block>
  );
};
