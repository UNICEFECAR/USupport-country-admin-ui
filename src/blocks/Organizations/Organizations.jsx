import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { useCustomNavigate as useNavigate } from "#hooks";

import {
  InputSearch,
  Block,
  BaseTable,
  Loading,
  Grid,
  GridItem,
  DateInput,
} from "@USupport-components-library/src";
import { useGetOrganizationsWithDetails } from "#hooks";
import { DeleteOrganization } from "#backdrops";

import "./organizations.scss";

/**
 * Organizations
 *
 * Organizations component - with complete organization details in table
 *
 * @return {jsx}
 */
export const Organizations = ({ setIsModalOpen, setOrganizationToEdit }) => {
  const country = localStorage.getItem("country");
  const { t, i18n } = useTranslation("blocks", { keyPrefix: "organizations" });
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    startDate: searchParams.get("startDate") || "",
    endDate: searchParams.get("endDate") || "",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  useEffect(() => {
    const nextParams = {};
    if (filters.search) nextParams.search = filters.search;
    if (filters.startDate) nextParams.startDate = filters.startDate;
    if (filters.endDate) nextParams.endDate = filters.endDate;
    setSearchParams(nextParams, { replace: true });
  }, [filters.search, filters.startDate, filters.endDate, setSearchParams]);

  const [dataToDisplay, setDataToDisplay] = useState();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [organizationToDelete, setOrganizationToDelete] = useState(null);

  const { data, isLoading } = useGetOrganizationsWithDetails(filters);

  let countryRows = [
    { label: t("name"), sortingKey: "name" },
    { label: t("unique_providers"), sortingKey: "uniqueProviders" },
    { label: t("unique_clients"), sortingKey: "uniqueClients" },
    { label: t("total_consultations"), sortingKey: "totalConsultations" },
  ];

  if (country === "RO") {
    countryRows = [
      { label: t("name"), sortingKey: "name" },
      { label: t("website"), sortingKey: "websiteUrl" },
      { label: t("address"), sortingKey: "address" },
      { label: t("phone"), sortingKey: "phone" },
      { label: t("email"), sortingKey: "email" },
      { label: t("district"), sortingKey: "district" },
      { label: t("payment_methods"), sortingKey: "paymentMethods" },
      { label: t("user_interactions"), sortingKey: "userInteractions" },
      { label: t("property_types"), sortingKey: "propertyTypes" },
      { label: t("specialisations"), sortingKey: "specialisations" },
      { label: t("description"), sortingKey: "description" },
      { label: t("unique_providers"), sortingKey: "uniqueProviders" },
      { label: t("unique_clients"), sortingKey: "uniqueClients" },
      { label: t("total_consultations"), sortingKey: "totalConsultations" },
    ];
  }

  useEffect(() => {
    if (data) {
      setDataToDisplay(data);
    }
  }, [data]);

  const rows = useMemo(() => {
    return countryRows;
  }, [i18n.language]);

  const getDescription = (item) => {
    const lang = i18n.language;
    if (lang === "uk" && item.description_uk) {
      return item.description_uk;
    }
    if (lang === "ro" && item.description_ro) {
      return item.description_ro;
    }
    return item.description || "-";
  };

  const rowsData = useMemo(() => {
    if (country !== "RO") {
      return dataToDisplay?.map((item) => {
        return [
          <p className="text">{item.name}</p>,
          <p className="text centered">{item.providers?.length || 0}</p>,
          <p className="text centered">{item.uniqueClients || 0}</p>,
          <p className="text centered">{item.totalConsultations || 0}</p>,
        ];
      });
    }
    return dataToDisplay?.map((item) => {
      return [
        <p className="text">{item.name}</p>,
        <p className="text">
          {item.websiteUrl ? (
            <a
              href={item.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={item.websiteUrl} // Add full URL as title for tooltip
            >
              {t("website_link")}
            </a>
          ) : (
            "-"
          )}
        </p>,
        <p className="text">{item.address || "-"}</p>,
        <p className="text">{item.phone || "-"}</p>,
        <p className="text">
          {item.email ? (
            <a
              href={`mailto:${item.email}`}
              title={item.email} // Add email as title for tooltip
            >
              {item.email}
            </a>
          ) : (
            "-"
          )}
        </p>,
        <p className="text">{t(item.district?.name) || "-"}</p>,
        <p className="text">
          {item.paymentMethods && item.paymentMethods.length > 0
            ? item.paymentMethods.map((pm) => t(pm.name)).join(", ")
            : "-"}
        </p>,
        <p className="text">
          {item.userInteractions && item.userInteractions.length > 0
            ? item.userInteractions
                .map((ui) => t(ui.name + "_interaction"))
                .join(", ")
            : "-"}
        </p>,
        <p className="text">
          {item.propertyTypes && item.propertyTypes.length > 0
            ? item.propertyTypes.map((pt) => t(pt.name)).join(", ")
            : "-"}
        </p>,
        <p className="text">
          {item.specialisations && item.specialisations.length > 0
            ? item.specialisations.map((s) => t(s.name)).join(", ")
            : "-"}
        </p>,
        <p className="text">{getDescription(item)}</p>,
        <p className="text centered">{item.providers?.length || 0}</p>,
        <p className="text centered">{item.uniqueClients || 0}</p>,
        <p className="text centered">{item.totalConsultations || 0}</p>,
      ];
    });
  }, [dataToDisplay, t, i18n.language]);

  const menuOptions = [
    {
      icon: "view",
      text: t("view"),
      handleClick: (id) => {
        const searchParams = new URLSearchParams({ organizationId: id });
        const hasSelectedDates = !!filters.startDate && !!filters.endDate;
        if (hasSelectedDates) {
          searchParams.set("startDate", filters.startDate);
          searchParams.set("endDate", filters.endDate);
        }
        navigate(`/organization-details?${searchParams.toString()}`);
      },
    },
    {
      icon: "edit",
      text: t("edit"),
      handleClick: (id) => {
        const organization = data.find((item) => item.organizationId === id);
        setOrganizationToEdit(organization);
        setIsModalOpen(true);
      },
    },
    {
      icon: "delete",
      text: t("delete_label"),
      handleClick: (id) => {
        const organization = data.find((item) => item.organizationId === id);
        setOrganizationToDelete(organization);
        setIsDeleteModalOpen(true);
      },
      iconColor: "#FF0000",
    },
  ];

  return (
    <React.Fragment>
      {organizationToDelete && (
        <DeleteOrganization
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          organization={organizationToDelete}
        />
      )}

      <Block classes="organizations">
        <Grid classes="organizations__filters-grid">
          <GridItem md={6} lg={4}>
            <InputSearch
              value={filters.search}
              onChange={(value) => setFilters({ ...filters, search: value })}
              placeholder={t("search")}
              classes="organizations__search-input"
            />
          </GridItem>
          <GridItem md={6} lg={4}>
            <DateInput
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
              placeholder={t("start_date")}
            />
          </GridItem>
          <GridItem md={6} lg={4}>
            <DateInput
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
              placeholder={t("end_date")}
            />
          </GridItem>
        </Grid>
        {isLoading ? (
          <Loading />
        ) : (
          <BaseTable
            data={data}
            rows={rows}
            rowsData={rowsData}
            handleClickPropName="organizationId"
            updateData={setDataToDisplay}
            menuOptions={menuOptions}
            t={t}
            maxHeightInVH={75}
            truncateLength={50}
            enableTooltips={true}
          />
        )}
      </Block>
    </React.Fragment>
  );
};
