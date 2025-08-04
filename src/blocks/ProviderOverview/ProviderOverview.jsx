import React from "react";
import { useTranslation } from "react-i18next";
import {
  Block,
  Button,
  GridItem,
  ProviderDetails,
  Loading,
} from "@USupport-components-library/src";

import { useGetProviderData } from "#hooks";

const AMAZON_S3_BUCKET = `${import.meta.env.VITE_AMAZON_S3_BUCKET}`;

import "./provider-overview.scss";

/**
 * ProviderOverview
 *
 * ProviderOverview block
 *
 * @return {jsx}
 */
export const ProviderOverview = ({ handleEditRedirect, providerId }) => {
  const { t } = useTranslation("blocks", { keyPrefix: "provider-overview" });

  const [providerDataQuery] = useGetProviderData(providerId);
  const provider = providerDataQuery.data;
  const image = AMAZON_S3_BUCKET + "/" + (provider?.image || "default");

  return (
    <Block classes="provider-profile">
      {providerDataQuery.isLoading || !provider ? (
        <Loading size="lg" />
      ) : (
        <ProviderDetails
          provider={provider}
          t={t}
          image={image}
          buttonComponent={
            <GridItem md={8} lg={12}>
              <Button
                label={t("edit_details")}
                color="purple"
                size="lg"
                onClick={handleEditRedirect}
                classes="provider-profile__edit-button"
              />
            </GridItem>
          }
        />
      )}
    </Block>
  );
};
