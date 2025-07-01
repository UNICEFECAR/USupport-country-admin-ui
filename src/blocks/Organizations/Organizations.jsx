import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCustomNavigate as useNavigate } from "#hooks";

import { Block, BaseTable, Loading } from "@USupport-components-library/src";
import { useGetOrganizationsWithDetails } from "#hooks";
import { CreateOrganization } from "#backdrops";

/**
 * Organizations
 *
 * Organizations component - with complete organization details in table
 *
 * @return {jsx}
 */
export const Organizations = () => {
  const country = localStorage.getItem("country");
  const { t, i18n } = useTranslation("organizations");
  const navigate = useNavigate();

  const { data, isLoading } = useGetOrganizationsWithDetails();

  const [dataToDisplay, setDataToDisplay] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [organizationToEdit, setOrganizationToEdit] = useState(null);

  let countryRows = [
    { label: t("name"), sortingKey: "name" },
    { label: t("unique_providers"), sortingKey: "uniqueProviders" },
    { label: t("unique_clients"), sortingKey: "uniqueClients" },
    { label: t("total_consultations"), sortingKey: "totalConsultations" },
  ];

  if (country === "RO") {
    countryRows = [
      { label: t("name"), sortingKey: "name" },
      { label: t("unit_name"), sortingKey: "unitName" },
      { label: t("website"), sortingKey: "websiteUrl" },
      { label: t("address"), sortingKey: "address" },
      { label: t("phone"), sortingKey: "phone" },
      { label: t("email"), sortingKey: "email" },
      { label: t("district"), sortingKey: "district" },
      { label: t("payment_method"), sortingKey: "paymentMethod" },
      { label: t("user_interaction"), sortingKey: "userInteraction" },
      { label: t("work_with"), sortingKey: "workWith" },
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
        <p className="text">{item.unitName || "-"}</p>,
        <p className="text">
          {item.websiteUrl ? (
            <a href={item.websiteUrl} target="_blank" rel="noopener noreferrer">
              {item.websiteUrl}
            </a>
          ) : (
            "-"
          )}
        </p>,
        <p className="text">{item.address || "-"}</p>,
        <p className="text">{item.phone || "-"}</p>,
        <p className="text">
          {item.email ? <a href={`mailto:${item.email}`}>{item.email}</a> : "-"}
        </p>,
        <p className="text">{t(item.district?.name) || "-"}</p>,
        <p className="text">
          {item.paymentMethod?.name ? t(item.paymentMethod.name) : "-"}
        </p>,
        <p className="text">
          {item.userInteraction?.name
            ? t(item.userInteraction.name + "_interaction")
            : "-"}
        </p>,
        <p className="text">
          {item.workWith && item.workWith.length > 0
            ? item.workWith.map((w) => t(w.topic)).join(", ")
            : "-"}
        </p>,
        <p className="text">
          {item.specialisations && item.specialisations.length > 0
            ? item.specialisations.map((s) => t(s.name)).join(", ")
            : "-"}
        </p>,
        <p className="text" title={item.description}>
          {item.description
            ? item.description.length > 50
              ? `${item.description.substring(0, 50)}...`
              : item.description
            : "-"}
        </p>,
        <p className="text centered">{item.providers?.length || 0}</p>,
        <p className="text centered">{item.uniqueClients || 0}</p>,
        <p className="text centered">{item.totalConsultations || 0}</p>,
      ];
    });
  }, [dataToDisplay, t]);

  const menuOptions = [
    {
      icon: "view",
      text: t("view"),
      handleClick: (id) =>
        navigate(`/organization-details?organizationId=${id}`),
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
  ];

  const handleModalClose = () => {
    setIsModalOpen(false);
    setOrganizationToEdit(null);
  };

  const handleAddOrganization = () => {
    setOrganizationToEdit(null);
    setIsModalOpen(true);
  };

  return (
    <React.Fragment>
      <CreateOrganization
        isOpen={isModalOpen}
        onClose={handleModalClose}
        organizationToEdit={organizationToEdit}
      />

      <Block classes="organizations">
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
            buttonLabel={t("add_button")}
            buttonAction={handleAddOrganization}
            t={t}
          />
        )}
      </Block>
    </React.Fragment>
  );
};
