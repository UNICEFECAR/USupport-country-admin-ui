import { useTranslation } from "react-i18next";
import React, { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { Page } from "#blocks";
import {
  useGetOrganizationById,
  useGetAllProviderNames,
  useAssignProvidersToOrganization,
  useRemoveProviderFromOrganization,
  useCustomNavigate as useNavigate,
} from "#hooks";

import {
  BaseTable,
  Block,
  Box,
  CheckBox,
  DateInput,
  DropdownWithLabel,
  Loading,
  Modal,
  InputSearch,
  Select,
} from "@USupport-components-library/src";
import {
  getDateView,
  getFirstAndLastDayOfPastMonth,
  hours,
  formatDateWithTimeRange,
  downloadCSVFile,
  getTime,
} from "@USupport-components-library/src/utils";

const { firstDay, lastDay } = getFirstAndLastDayOfPastMonth();

const initialFilters = {
  search: "",
  startDate: firstDay,
  endDate: lastDay,
  startTime: "09:00",
  endTime: "17:00",
  weekdays: true,
  weekends: false,
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};
const hoursOptions = hours.map((hour) => ({ label: hour, value: hour }));

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
  const { t, i18n } = useTranslation("pages", {
    keyPrefix: "organization-details-page",
  });
  const navigate = useNavigate();

  const organizationId = new URLSearchParams(window.location.search).get(
    "organizationId"
  );

  const [dataToDisplay, setDataToDisplay] = useState();
  const [showAddProviderModal, setShowAddProviderModal] = useState(false);
  const [providersToAdd, setProvidersToAdd] = useState([]);
  const [providerToRemove, setProviderToRemove] = useState();
  const [filters, setFilters] = useState({
    ...initialFilters,
  });
  const [appliedFilters, setAppliedFilters] = useState({
    ...filters,
  });

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  if (!organizationId) {
    return (
      <Navigate
        to={`/country-admin/${localStorage.getItem("language")}/organizations`}
      />
    );
  }

  const { data, isLoading } = useGetOrganizationById(
    organizationId,
    appliedFilters
  );
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
      { isCentered: true, label: t("leave_date"), sortingKey: "leaveDate" },
    ];
  }, [i18n.language]);

  const rowsData = useMemo(() => {
    return dataToDisplay?.map((item) => {
      return [
        <p className="text">{item.name}</p>,
        <p className="text centered">{item.clients}</p>,
        <p className="text centered">{item.consultations_count}</p>,
        <p className="text centered">{getDateView(item.joinDate)}</p>,
        <p className="text centered">
          {item.leaveDate ? getDateView(item.leaveDate) : "-"}
        </p>,
      ];
    });
  }, [dataToDisplay]);

  // Options for the select component
  const getProviderOptions = useMemo(() => {
    if (!allProviders || !data) return [];

    if (data) {
      const existingProviders = data.providers.reduce((acc, provider) => {
        if (!provider.leaveDate) {
          acc.push(provider.providerDetailId);
        }
        return acc;
      }, []);

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
  }, [i18n.language, dataToDisplay]);

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

  const handleCsvExport = () => {
    let csv = "\uFEFF";
    const headers = [
      t("provider_name"),
      t("client_name"),
      t("time"),
      t("client_joined"),
      t("client_joined_at"),
      t("provider_joined"),
      t("provider_joined_at"),
      t("created_at"),
    ];

    csv += headers.join(",");
    csv += "\n";

    dataToDisplay.forEach((row) => {
      row.consultations?.forEach((consultation) => {
        let clientJoined = consultation.client_join_time ? t("yes") : t("no");
        let providerJoined = consultation.provider_join_time
          ? t("yes")
          : t("no");
        let clientJoinedAt = consultation.client_join_time
          ? getTime(consultation.client_join_time)
          : "-";
        let providerJoinedAt = consultation.provider_join_time
          ? getTime(consultation.provider_join_time)
          : "-";

        csv += `${row.name},`;
        csv += `${consultation.clientName},`;
        csv += `${formatDateWithTimeRange(new Date(consultation.time))},`;
        csv += `${clientJoined},`;
        csv += `${clientJoinedAt},`;
        csv += `${providerJoined},`;
        csv += `${providerJoinedAt},`;
        csv += `${getDateView(consultation.created_at)}`;
        csv += "\n";
      });
    });

    const fileName = `${data.name}_consultations(${getDateView(
      filters.startDate
    )} - ${getDateView(filters.endDate)}).csv`;
    downloadCSVFile(csv, fileName);
  };

  return (
    <Page
      classes="page__organization-details"
      heading={t("heading", { name: data?.name || "" })}
      handleGoBack={() => navigate(-1)}
    >
      <Modal
        isOpen={isFilterModalOpen}
        closeModal={() => {
          setIsFilterModalOpen(false);
          setFilters(appliedFilters);
        }}
        heading={t("filters")}
        ctaLabel={t("apply")}
        ctaHandleClick={() => {
          setAppliedFilters(filters);
          setIsFilterModalOpen(false);
        }}
        secondaryCtaLabel={t("reset_filters")}
        secondaryCtaHandleClick={() => {
          setFilters(initialFilters);
          setAppliedFilters(initialFilters);
          setIsFilterModalOpen(false);
        }}
        secondaryCtaType="secondary"
        classes="page__organization-details__filters-modal"
      >
        <div className="page__organization-details__filters-modal__content">
          <InputSearch
            value={filters.search}
            placeholder={t("search")}
            onChange={(val) => setFilters({ ...filters, search: val })}
          />
          <DateInput
            value={filters.startDate}
            label={t("start_date")}
            onChange={(e) =>
              setFilters({ ...filters, startDate: e.target.value })
            }
          />

          <DateInput
            value={filters.endDate}
            label={t("end_date")}
            onChange={(e) =>
              setFilters({ ...filters, endDate: e.target.value })
            }
          />
          <DropdownWithLabel
            label={t("start_time")}
            options={hoursOptions}
            selected={filters.startTime}
            setSelected={(value) =>
              setFilters({ ...filters, startTime: value })
            }
          />
          <DropdownWithLabel
            label={t("end_time")}
            options={hoursOptions}
            selected={filters.endTime}
            setSelected={(value) => setFilters({ ...filters, endTime: value })}
          />
          <div className="page__organization-details__filters-modal__checkbox-container">
            <CheckBox
              label={t("weekdays")}
              isChecked={filters.weekdays}
              setIsChecked={() => {
                setFilters({ ...filters, weekdays: !filters.weekdays });
              }}
            />
            <CheckBox
              label={t("weekends")}
              isChecked={filters.weekends}
              setIsChecked={() => {
                setFilters({ ...filters, weekends: !filters.weekends });
              }}
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!providerToRemove}
        closeModal={() => setProviderToRemove(null)}
        heading={t("remove_provider")}
        text={t("remove_provider_subheading", {
          name: providerToRemove?.name,
          organizationName: data?.name,
        })}
        ctaLabel={t("remove")}
        ctaColor="red"
        overlayClasses="page__organization-details__modal-overlay"
        ctaHandleClick={() => {
          removeProviderMutation.mutate({
            organizationId,
            providerDetailId: providerToRemove.providerDetailId,
          });
        }}
        isCtaLoading={removeProviderMutation.isLoading}
      >
        {providerToRemove?.futureConsultations ? (
          <h3 style={{ marginTop: "2rem" }}>
            {t("has_future_consultations", {
              count: providerToRemove?.futureConsultations,
            })}
          </h3>
        ) : null}
      </Modal>
      <Modal
        isOpen={showAddProviderModal}
        closeModal={() => setShowAddProviderModal(false)}
        heading={t("add_providers")}
        ctaLabel={t("add")}
        ctaHandleClick={() => {
          assignProvidersMutation.mutate({
            organizationId,
            providerDetailIds: providersToAdd.map((x) => x.value),
          });
        }}
        isCtaLoading={assignProvidersMutation.isLoading}
        overlayClasses="page__organization-details__modal-overlay"
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
      {isLoading || isProvidersLoading ? (
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
            secondaryButtonLabel={t("filters")}
            secondaryButtonAction={() => setIsFilterModalOpen(true)}
            thirdButtonLabel={t("export_report")}
            thirdButtonAction={handleCsvExport}
            filters={appliedFilters}
            t={t}
          />
        </Block>
      )}
    </Page>
  );
};
