import React from "react";
import {
  Block,
  Button,
  Grid,
  GridItem,
  Loading,
  ProviderOverview,
} from "@USupport-components-library/src";
import { useGetProvidersData } from "#hooks";

import "./providers.scss";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

/**
 * Providers
 *
 * Display all the providers
 *
 * @return {jsx}
 */
export const Providers = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("providers");
  const providersQuery = useGetProvidersData()[0];

  const redirectToEditProvider = (id) => {
    navigate(`/edit-provider?id=${id}`);
  };

  const redirectToProviderDetails = (id) => {
    navigate(`/provider/details?id=${id}`);
  };

  return (
    <Block classes="providers">
      <Grid classes="providers__grid">
        <GridItem md={8} lg={12} classes="providers__grid__heading">
          <h2>{t("providers")} </h2>
          <Button
            label={t("create_provider")}
            classes="providers__create-provider-button"
            onClick={() => navigate("/create-provider")}
            color="purple"
          />
        </GridItem>
        {providersQuery.isLoading ? (
          <GridItem md={8} lg={12}>
            <Loading size="lg" />
          </GridItem>
        ) : (
          providersQuery.data?.map((provider, index) => {
            return (
              <GridItem key={index} md={4} lg={4}>
                <ProviderOverview
                  image={provider.image}
                  name={provider.name}
                  patronym={provider.patronym}
                  surname={provider.surname}
                  specializations={provider.specializations.map((x) => t(x))}
                  hasMenu
                  handleEdit={() =>
                    redirectToEditProvider(provider.providerDetailId)
                  }
                  handleViewProfile={() =>
                    redirectToProviderDetails(provider.providerDetailId)
                  }
                />
              </GridItem>
            );
          })
        )}
      </Grid>
    </Block>
  );
};
