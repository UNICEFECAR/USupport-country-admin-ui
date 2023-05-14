import React, {
  useCallback,
  useRef,
  useState,
  useEffect,
  useMemo,
} from "react";
import { useTranslation } from "react-i18next";
import InfiniteScroll from "react-infinite-scroll-component";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Avatar,
  BaseTable,
  Block,
  Button,
  DropdownWithLabel,
  Grid,
  GridItem,
  Icon,
  Input,
  Loading,
  Modal,
  ProviderOverview,
  Toggle,
} from "@USupport-components-library/src";
import { adminSvc } from "@USupport-components-library/services";

import { useUpdateProviderStatus } from "#hooks";

import "./providers.scss";

const AMAZON_S3_BUCKET = `${import.meta.env.VITE_AMAZON_S3_BUCKET}`;

/**
 * Providers
 *
 * Display all the providers
 *
 * @return {jsx}
 */
export const Providers = ({
  displayListView,
  isFilterModalOpen,
  setIsFilterModalOpen,
}) => {
  const initialFilters = {
    price: "",
    status: "",
    free: false,
    specialization: "",
  };
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("providers");
  const queryClient = useQueryClient();
  const currencySymbol = localStorage.getItem("currency_symbol");

  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState();

  const fetchProvidersData = async ({ pageParam = 1 }) => {
    const { data } = await adminSvc.getAllProviders(pageParam, filters);
    const formattedData = [];
    for (let i = 0; i < data.length; i++) {
      const providerData = data[i];
      const formattedProvider = {
        providerDetailId: providerData.provider_detail_id || "",
        name: providerData.name || "",
        patronym: providerData.patronym || "",
        surname: providerData.surname || "",
        nickname: providerData.nickname || "",
        email: providerData.email || "",
        image: providerData.image || "default",
        specializations: providerData.specializations || [],
        consultationPrice: providerData.consultation_price || 0,
        status: providerData.status,
      };
      formattedData.push(formattedProvider);
    }
    return formattedData;
  };

  const providersQuery = useInfiniteQuery(
    ["all-providers", appliedFilters],
    fetchProvidersData,
    {
      getNextPageParam: (lastPage, pages) => {
        if (lastPage.length === 0) return undefined;
        return pages.length + 1;
      },
    }
  );

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
    if (!providersQuery.data?.pages || providersQuery.data?.pages.length === 0)
      return (
        <GridItem md={8} lg={12}>
          <h4>{t("no_providers")}</h4>
        </GridItem>
      );
    return providersQuery.data.pages?.flat().map((provider, index) => {
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
  }, [providersQuery.data]);

  const menuOptions = [
    {
      icon: "person",
      text: t("view"),
      handleClick: (id) => redirectToProviderDetails(id),
    },
    {
      icon: "edit",
      text: t("edit"),
      handleClick: (id) => redirectToEditProvider(id),
    },
    {
      icon: "activities",
      text: t("activities"),
      handleClick: (id) => {
        const provider = providersQuery.data.pages
          ?.flat()
          .find((x) => x.providerDetailId === id);
        navigate(
          `/provider-activities?providerId=${provider.providerDetailId}`,
          {
            state: {
              providerName: `${provider.name} ${provider.patronym} ${provider.surname}`,
            },
          }
        );
      },
    },
  ];

  const handleFilterSave = () => {
    setAppliedFilters(filters);
    setIsFilterModalOpen(false);
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setIsFilterModalOpen(false);
  };

  const rows = useMemo(() => {
    return [
      {
        label: t("name"),
        // sortingKey: "displayName",
      },
      {
        label: t("email"),
        // sortingKey: "email",
      },

      {
        label: t("status"),
        isCentered: true,
        // sortingKey: "status",
      },
      {
        label: t("price"),
        isCentered: true,
        // sortingKey: "consultationPrice",
      },
      {
        label: t("specializations"),
        // sortingKey: "specializations",
      },
      {
        label: t("actions"),
        isCentered: true,
      },
    ];
  }, [i18n.language]);

  const rowsData = providersQuery.data?.pages?.flat().map((provider, idx) => {
    return [
      <div className="providers__list-view__name">
        <Avatar image={AMAZON_S3_BUCKET + "/" + provider.image} size="sm" />
        <p>{`${provider.name} ${provider.patronym || ""} ${
          provider.surname
        }`}</p>
      </div>,

      <p>{provider.email}</p>,

      <div
        className={`providers__list-view__status providers__list-view__status--${provider.status}`}
      >
        <p className="small-text">{t(provider.status)}</p>
      </div>,

      <div
        className={[
          "providers__list-view__price-badge",
          !provider.consultationPrice &&
            "providers__list-view__price-badge--free",
        ].join(" ")}
      >
        <p className="small-text">
          {provider.consultationPrice
            ? `${provider.consultationPrice}${currencySymbol}`
            : t("free")}
        </p>
      </div>,

      <p>{provider.specializations.map((x) => t(x)).join(", ")}</p>,

      <div
        onClick={() => {
          openDeleteModal(provider.providerDetailId, provider.status);
        }}
        className="providers__list-view__actions-container"
      >
        <Icon
          color={provider.status === "active" ? "#eb5757" : "#20809E"}
          name={
            provider.status === "active"
              ? "circle-actions-close"
              : "circle-actions-success"
          }
          size="md"
        />
        <p className="text centered">
          {provider.status === "active" ? t("deactivate") : t("activate")}
        </p>
      </div>,
    ];
  });
  return (
    <Block classes="providers">
      <InfiniteScroll
        dataLength={providersQuery.data?.pages.length || 0}
        next={providersQuery.fetchNextPage}
        hasMore={providersQuery.hasNextPage}
        loader={<Loading />}
        className="providers__infinite-scroll"
        initialScrollY={20}
        hasChildren={true}
        scrollThreshold={0}
      >
        <Grid classes="providers__grid">
          {providersQuery.isLoading ? (
            <GridItem md={8} lg={12}>
              <Loading size="lg" />
            </GridItem>
          ) : !displayListView ? (
            renderProviders()
          ) : null}
        </Grid>
        {!providersQuery.isLoading && displayListView && (
          <BaseTable
            data={providersQuery.data?.pages?.flat() || []}
            rows={rows}
            rowsData={rowsData}
            menuOptions={menuOptions}
            handleClickPropName={"providerDetailId"}
            t={t}
          />
        )}
      </InfiniteScroll>

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
