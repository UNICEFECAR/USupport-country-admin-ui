import React, { useCallback, useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Block,
  Button,
  DropdownWithLabel,
  Grid,
  GridItem,
  Input,
  Loading,
  Modal,
  ProviderOverview,
  Toggle,
} from "@USupport-components-library/src";
// import { providerSvc } from "@USupport-components-library/services";
import { useGetProvidersData, useUpdateProviderStatus } from "#hooks";

import "./providers.scss";
/**
 * Providers
 *
 * Display all the providers
 *
 * @return {jsx}
 */
export const Providers = () => {
  const initialFilters = {
    price: "",
    status: "",
    free: false,
    specialization: "",
  };

  const navigate = useNavigate();
  const { t } = useTranslation("providers");
  const queryClient = useQueryClient();
  const providersQuery = useGetProvidersData()[0];
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [filters, setFilters] = useState(initialFilters);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const [dataToDisplay, setDataToDisplay] = useState();

  const selectedProviderStatus = useRef();

  const redirectToEditProvider = (id) => {
    navigate(`/edit-provider?id=${id}`);
  };

  const redirectToProviderDetails = (id) => {
    navigate(`/provider/details?id=${id}`);
  };

  const openDeleteModal = (id, status) => {
    selectedProviderStatus.current = {
      status,
      id,
    };
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => setIsDeleteModalOpen(false);

  const onSuccess = (data) => {
    queryClient.invalidateQueries({ queryKey: ["all-providers"] });
    const newStatus = data.newStatus;
    toast(
      t(newStatus === "active" ? "provider_activated" : "provider_deactivated")
    );
    closeDeleteModal();
  };
  const onError = (err) => {
    toast(err, { type: "error" });
  };
  const updateProviderStatusMutation = useUpdateProviderStatus(
    onSuccess,
    onError
  );

  const handleStatusChange = () => {
    const status = selectedProviderStatus.current?.status;
    const id = selectedProviderStatus.current?.id;
    const newStatus = status === "active" ? "inactive" : "active";

    updateProviderStatusMutation.mutate({ providerId: id, status: newStatus });
  };

  useEffect(() => {
    if (providersQuery.data) {
      setDataToDisplay(providersQuery.data);
    }
  }, [providersQuery.data]);

  const renderProviders = useCallback(() => {
    if (!dataToDisplay || dataToDisplay?.length === 0)
      return (
        <GridItem md={8} lg={12}>
          <h4>{t("no_providers")}</h4>
        </GridItem>
      );
    return dataToDisplay?.map((provider, index) => {
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
            t={t}
            handleViewProfile={() =>
              redirectToProviderDetails(provider.providerDetailId)
            }
            handleUpdateStatus={() =>
              openDeleteModal(provider.providerDetailId, provider.status)
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
  }, [dataToDisplay]);

  const handleFilterSave = () => {
    const dataCopy = [...providersQuery.data];

    const filteredData = dataCopy.filter((provider) => {
      const { price, status, free, specialization } = filters;
      console.log(provider);
      if (price && provider.consultationPrice < Number(price)) return false;
      if (status && provider.status !== status) return false;
      if (free && provider.consultationPrice > 0) return false;
      if (specialization && !provider.specializations.includes(specialization))
        return false;

      return true;
    });

    setIsFilterModalOpen(false);
    setDataToDisplay(filteredData);
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
    setIsFilterModalOpen(false);
    setDataToDisplay(providersQuery.data);
  };

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
            />
            <Button
              label={t("filter_providers")}
              onClick={() => setIsFilterModalOpen(true)}
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
        heading={
          selectedProviderStatus.current?.status === "active"
            ? t("modal_heading_deactivate")
            : t("modal_heading_activate")
        }
        text={
          selectedProviderStatus.current?.status === "active"
            ? t("modal_text_deactivate")
            : t("modal_text_activate")
        }
        isOpen={isDeleteModalOpen}
        closeModal={closeDeleteModal}
        classes="providers__delete-modal"
        ctaLabel={t("yes")}
        ctaHandleClick={handleStatusChange}
        ctaColor={
          selectedProviderStatus.current?.status === "active" ? "red" : "green"
        }
        isCtaLoading={updateProviderStatusMutation.isLoading}
        secondaryCtaLabel={t("no")}
        secondaryCtaHandleClick={closeDeleteModal}
        secondaryCtaType="secondary"
      />

      <Modal
        classes="providers__filter-modal"
        heading={t("filter_providers")}
        isOpen={isFilterModalOpen}
        closeModal={() => setIsFilterModalOpen(false)}
      >
        <Input
          label={t("min_price")}
          value={filters.price}
          placeholder={0}
          onChange={(e) => {
            const value = e.target.value;
            if (!isNaN(Number(value))) {
              setFilters({ ...filters, price: e.target.value });
            }
          }}
        />
        <DropdownWithLabel
          label={t("status")}
          options={[
            { label: t("all"), value: "" },
            { label: t("active"), value: "active" },
            { label: t("inactive"), value: "inactive" },
          ]}
          selected={filters.status}
          setSelected={(val) => {
            setFilters({ ...filters, status: val });
          }}
        />
        <DropdownWithLabel
          label={t("specialization")}
          options={[
            { label: t("all"), value: "" },
            { label: t("psychologist"), value: "psychologist" },
            { label: t("psychiatrist"), value: "psychiatrist" },
            { label: t("psychotherapist"), value: "psychotherapist" },
          ]}
          selected={filters.specialization}
          setSelected={(val) => setFilters({ ...filters, specialization: val })}
        />
        <div className="providers__filter-modal__toggle-container">
          <p className="paragraph">{t("show_only_free")}</p>
          <Toggle
            isToggled={filters.free}
            setParentState={() =>
              setFilters({ ...filters, free: !filters.free })
            }
          />
        </div>
        <Button
          label={t("apply_filter")}
          size="lg"
          onClick={handleFilterSave}
          classes="providers__filter-modal__submit-button"
        />
        <Button
          label={t("reset_filter")}
          type="secondary"
          size="lg"
          onClick={handleResetFilters}
          classes="providers__filter-modal__reset-button"
        />
      </Modal>
    </Block>
  );
};
