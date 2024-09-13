import { useTranslation } from "react-i18next";
import React, { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { Page } from "#blocks";
import {
  useGetOrganizationById,
  useGetAllProviderNames,
  useAssignProvidersToOrganization,
  useRemoveProviderFromOrganization,
} from "#hooks";

import {
  Loading,
  BaseTable,
  Block,
  Box,
  Select,
  Modal,
} from "@USupport-components-library/src";
import { getDateView } from "@USupport-components-library/src/utils";

import "./organization-details.scss";

/**
 * OrganizationDetails
 *
 * Display details about organization
 *
 * @returns {JSX.Element}
 */
export const OrganizationDetails = () => {
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation("organization-details-page");
  const navigate = useNavigate();

  const organizationId = new URLSearchParams(window.location.search).get(
    "organizationId"
  );

  const [dataToDisplay, setDataToDisplay] = useState();
  const [showAddProviderModal, setShowAddProviderModal] = useState(false);
  const [providersToAdd, setProvidersToAdd] = useState([]);
  const [providerToRemove, setProviderToRemove] = useState();

  if (!organizationId) {
    return <Navigate to="/organizations" />;
  }

  const { data, isLoading } = useGetOrganizationById(organizationId);
  const { data: allProviders, isLoading: isProvidersLoading } =
    useGetAllProviderNames();

  useEffect(() => {
    if (data) {
      setDataToDisplay(data.providers);
    }
  }, [data]);

  const rows = useMemo(() => {
    return [
      { label: t("name"), sortingKey: "name" },
      { isCentered: true, label: t("clients"), sortingKey: "clients" },
      {
        isCentered: true,
        label: t("consultations"),
        sortingKey: "consultations",
      },
      { isCentered: true, label: t("joined_date"), sortingKey: "joinDate" },
    ];
  }, [i18n.language]);

  const rowsData = useMemo(() => {
    return dataToDisplay?.map((item) => {
      return [
        <p className="text">{item.name}</p>,
        <p className="text centered">{item.clients}</p>,
        <p className="text centered">{item.consultations}</p>,
        <p className="text centered">{getDateView(item.joinDate)}</p>,
      ];
    });
  }, [dataToDisplay]);

  // Options for the select component
  const getProviderOptions = useMemo(() => {
    if (!allProviders || !data) return [];

    if (data) {
      const existingProviders = data.providers.map(
        (provider) => provider.providerDetailId
      );

      return allProviders.reduce((acc, provider) => {
        if (existingProviders.includes(provider.providerDetailId)) return acc;
        acc.push({
          value: provider.providerDetailId,
          label: provider.name,
          selected: false,
        });
        return acc;
      }, []);
    }
  }, [allProviders, data]);

  const menuOptions = useMemo(() => {
    return [
      {
        icon: "trash",
        text: t("remove"),
        iconColor: "#FF0000",
        handleClick: (id) => {
          const provider = dataToDisplay.find(
            (provider) => provider.providerDetailId === id
          );
          setProviderToRemove(provider);
        },
      },
    ];
  }, [i18n.language]);

  const onProvidersAssignSuccess = () => {
    toast(t("provider_assigned"));

    setShowAddProviderModal(false);
    queryClient.invalidateQueries({
      queryKey: ["GetOrganizationById", organizationId],
    });
  };
  const onProvidersAssignError = (err) => {
    toast.error(t(err));
  };

  const assignProvidersMutation = useAssignProvidersToOrganization(
    onProvidersAssignSuccess,
    onProvidersAssignError
  );

  const onProviderRemoveSuccess = () => {
    toast(t("provider_removed"));
    setProviderToRemove(null);
    queryClient.invalidateQueries({
      queryKey: ["GetOrganizationById", organizationId],
    });
  };

  const removeProviderMutation = useRemoveProviderFromOrganization(
    onProviderRemoveSuccess,
    onProvidersAssignError
  );

  return (
    <Page
      classes="page__organization-details"
      heading={t("heading", { name: data?.name || "" })}
      handleGoBack={() => navigate(-1)}
    >
      <Modal
        isOpen={!!providerToRemove}
        closeModal={() => setProviderToRemove(null)}
        heading={t("remove_provider")}
        text={t("remove_provider_subheading", {
          name: providerToRemove?.name,
        })}
        ctaLabel={t("remove")}
        ctaHandleClick={() => {
          removeProviderMutation.mutate({
            organizationId,
            providerDetailId: providerToRemove.providerDetailId,
          });
        }}
        isCtaLoading={removeProviderMutation.isLoading}
      />
      <Modal
        isOpen={showAddProviderModal}
        closeModal={() => setShowAddProviderModal(false)}
        heading={t("add_providers")}
        ctaLabel={t("add")}
        ctaHandleClick={() => {
          console.log("click");
          console.log(providersToAdd);
          assignProvidersMutation.mutate({
            organizationId,
            providerDetailIds: providersToAdd.map((x) => x.value),
          });
        }}
        isCtaLoading={assignProvidersMutation.isLoading}
        classes="page__organization-details__modal"
      >
        <Select
          placeholder={t("select")}
          options={getProviderOptions}
          label={t("select_providers")}
          handleChange={(options) => {
            setProvidersToAdd(options.filter((option) => option.selected));
          }}
        />
      </Modal>
      {isLoading ? (
        <Loading />
      ) : (
        <Block>
          <Box boxShadow={2} classes="page__organization-details__box">
            <h4>{t("providers", { count: dataToDisplay?.length })}</h4>
            <h4>
              {t("consultations_number", { count: data.totalConsultations })}
            </h4>
            <h4>{t("clients_number", { count: data.totalClients })}</h4>
          </Box>
          <BaseTable
            data={data.providers}
            rows={rows}
            rowsData={rowsData}
            handleClickPropName="providerDetailId"
            updateData={setDataToDisplay}
            menuOptions={menuOptions}
            buttonLabel={t("add_providers")}
            buttonAction={() => setShowAddProviderModal(true)}
            // secondaryButtonLabel={t("filter_button")}
            t={t}
          />
        </Block>
      )}
    </Page>
  );
};
