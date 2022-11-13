import React from "react";
import {
  Block,
  Grid,
  GridItem,
  Statistic,
} from "@USupport-components-library/src";
import { useWindowDimensions } from "@USupport-components-library/src/utils";
import { useTranslation } from "react-i18next";

import "./statistics.scss";

/**
 * Statistics
 *
 * Statistics block
 *
 * @return {jsx}
 */
export const Statistics = () => {
  const { t } = useTranslation("statistics");

  const { width } = useWindowDimensions();

  const statistics = [
    { iconName: "community", textBold: "50", text: "Clients" },
    { iconName: "therapy", textBold: "20", text: "Providers" },
    { iconName: "article", textBold: "60", text: "Published articles" },
    {
      iconName: "live-consultation",
      textBold: "120",
      text: "Booked consultations",
    },
  ];

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
            textBold={statistic.textBold}
            text={statistic.text}
            iconName={statistic.iconName}
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
        {renderAllStatistics()}
      </Grid>
    </Block>
  );
};
