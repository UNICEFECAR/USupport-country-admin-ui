import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Block,
  Button,
  Grid,
  GridItem,
  Loading,
  ProviderOverview,
  Modal,
} from "@USupport-components-library/src";
import { providerSvc } from "@USupport-components-library/services";
import { useGetProvidersData, useError, useUpdateProviderStatus } from "#hooks";

import "./providers.scss";
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
  const queryClient = useQueryClient();
  const providersQuery = useGetProvidersData()[0];
  const [providerId, setProviderId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const redirectToEditProvider = (id) => {
    navigate(`/edit-provider?id=${id}`);
  };

  const redirectToProviderDetails = (id) => {
    navigate(`/provider/details?id=${id}`);
  };

  const deleteProvider = async () => {
    setIsDeleteModalOpen(false);
    await providerSvc.deleteProviderByIdAsAdmin(providerId);
  };
  const deleteMutation = useMutation(deleteProvider, {
    onMutate: () => {
      const oldData = queryClient.getQueryData({ queryKey: ["all-providers"] });

      queryClient.setQueryData(
        { queryKey: ["all-providers"] },
        [...oldData].filter((x) => x.providerDetailId !== providerId)
      );

      return () => {
        queryClient.setQueryData({ queryKey: ["all-providers"] }, oldData);
      };
    },
    onSuccess: () => toast(t("provider_deleted")),
    onError: (error, variables, rollback) => {
      const { message: errorMessage } = useError(error);
      toast(errorMessage, { type: "error" });
      rollback();
    },
  });

  const handleDelete = () => deleteMutation.mutate();

  const closeDeleteModal = () => setIsDeleteModalOpen(false);

  const onSuccess = (data) => {
    queryClient.invalidateQueries({ queryKey: ["all-providers"] });
    const newStatus = data.newStatus;
    toast(
      t(newStatus === "active" ? "provider_activated" : "provider_deactivated")
    );
  };
  const onError = (err) => {
    toast(err, { type: "error" });
  };
  const updateProviderStatusMutation = useUpdateProviderStatus(
    onSuccess,
    onError
  );

  const handleStatusChange = (id, status) => {
    const newStatus = status === "active" ? "inactive" : "active";
    updateProviderStatusMutation.mutate({ providerId: id, status: newStatus });
  };

  const renderProviders = useCallback(() => {
    if (!providersQuery.data || providersQuery.data?.length === 0)
      return (
        <GridItem md={8} lg={12}>
          <h4>{t("no_providers")}</h4>
        </GridItem>
      );
    return providersQuery.data?.map((provider, index) => {
      return (
        <GridItem key={index} md={4} lg={4}>
          <ProviderOverview
            image={provider.image}
            name={provider.name}
            patronym={provider.patronym}
            surname={provider.surname}
            specializations={provider.specializations.map((x) => t(x))}
            price={provider.consultationPrice}
            freeLabel={t("free")}
            statusChangeLabel={
              provider.status === "active" ? t("deactivate") : t("activate")
            }
            activitiesLabel={t("activities")}
            providerStatus={provider.status}
            hasMenu
            showActivities
            handleEdit={() => redirectToEditProvider(provider.providerDetailId)}
            handleViewProfile={() =>
              redirectToProviderDetails(provider.providerDetailId)
            }
            handleUpdateStatus={() =>
              handleStatusChange(provider.providerDetailId, provider.status)
            }
            handleActivities={() =>
              navigate(
                `/provider-activities?providerId=${provider.providerDetailId}`,
                {
                  state: {
                    providerName: `${provider.name} ${provider.patronym} ${provider.surname}`,
                  },
                }
              )
            }
          />
        </GridItem>
      );
    });
  }, [providersQuery.data]);

  return (
    <Block classes="providers">
      <Grid classes="providers__grid">
        <GridItem md={8} lg={12} classes="providers__grid__heading">
          <h2>{t("providers")} </h2>
          <div className="providers__grid__heading__button-container">
            <Button
              label={t("create_provider")}
              classes="providers__create-provider-button"
              onClick={() => navigate("/create-provider")}
              size="sm"
              color="purple"
            />
          </div>
        </GridItem>
        {providersQuery.isLoading ? (
          <GridItem md={8} lg={12}>
            <Loading size="lg" />
          </GridItem>
        ) : (
          renderProviders()
        )}
      </Grid>
      <Modal
        heading={t("modal_heading")}
        isOpen={isDeleteModalOpen}
        closeModal={closeDeleteModal}
        classes="providers__delete-modal"
        ctaLabel={t("yes")}
        ctaHandleClick={handleDelete}
        secondaryCtaLabel={t("no")}
        secondaryCtaHandleClick={closeDeleteModal}
        secondaryCtaType="secondary"
      ></Modal>
    </Block>
  );
};
