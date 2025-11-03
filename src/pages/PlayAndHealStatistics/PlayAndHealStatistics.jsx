import React from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

import { Page } from "#blocks";
import {
  Box,
  Block,
  Grid,
  GridItem,
  Loading,
} from "@USupport-components-library/src";
import { adminSvc } from "@USupport-components-library/services";

import "./play-and-heal-statistics.scss";

export const PlayAndHealStatistics = () => {
  const { t } = useTranslation("pages", { keyPrefix: "pl-statistics-page" });

  const { data, isLoading } = useQuery(["pl-playandheal-visits"], () =>
    adminSvc.getPlayAndHealVisits().then((res) => res.data)
  );

  const events = data || [];
  const normalVisits = events.filter(
    (e) => e.event_type === "playandheal_visit"
  ).length;
  const qrVisits = events.filter(
    (e) => e.event_type === "playandheal_visit_qr"
  ).length;
  const totalVisits = normalVisits + qrVisits;

  const IS_RTL = localStorage.getItem("language") === "ar";
  return (
    <Page
      classes={`play-and-heal-statistics ${
        IS_RTL ? "play-and-heal-statistics--rtl" : ""
      }`}
      heading={t("heading")}
      showGoBackArrow={false}
    >
      <Block>
        <Grid>
          {isLoading ? (
            <GridItem md={8} lg={12}>
              <Loading size="lg" />
            </GridItem>
          ) : (
            <>
              <GridItem md={4} lg={6}>
                <Box
                  classes="play-and-heal-statistics__item"
                  borderSize="lg"
                  boxShadow={2}
                >
                  <h3>{t("web_visits")}</h3>
                  <div className="ph-stat__value">{totalVisits}</div>
                </Box>
              </GridItem>
              <GridItem md={4} lg={6}>
                <Box
                  classes="play-and-heal-statistics__item"
                  borderSize="lg"
                  boxShadow={2}
                >
                  <h3>{t("qr_visits")}</h3>
                  <div className="ph-stat__value">{qrVisits}</div>
                </Box>
              </GridItem>
            </>
          )}
        </Grid>
      </Block>
    </Page>
  );
};

export default PlayAndHealStatistics;
