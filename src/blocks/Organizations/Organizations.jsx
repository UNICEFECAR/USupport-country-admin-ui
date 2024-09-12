import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import {
  Block,
  BaseTable,
  Loading,
  Modal,
  Input,
} from "@USupport-components-library/src";
import { useGetOrganizationsWithDetails, useEditOrganization } from "#hooks";

import "./organizations.scss";
import { useQueryClient } from "@tanstack/react-query";
import useCreateOrganization from "../../hooks/useCreateOrganization";

/**
 * Organizations
 *
 * Organizations
 *
 * @return {jsx}
 */
export const Organizations = () => {
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation("organizations");

  const { data, isLoading } = useGetOrganizationsWithDetails();

  const [dataToDisplay, setDataToDisplay] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [organizationToEdit, setOrganizationToEdit] = useState();
  const [newOrganizationName, setNewOrganizationName] = useState("");

  useEffect(() => {
    if (data) {
      setDataToDisplay(data);
    }
  }, [data]);

  const rows = useMemo(() => {
    return [
      { label: t("name"), sortingKey: "name" },
      { label: t("unique_providers"), sortingKey: "uniqueProviders" },
      { label: t("unique_clients"), sortingKey: "uniqueClients" },
      { label: t("total_consultations"), sortingKey: "totalConsultations" },
    ];
  }, [i18n.language]);

  const rowsData = useMemo(() => {
    return dataToDisplay?.map((item) => {
      return [
        <p className="text">{item.name}</p>,
        <p className="text centered">{item.uniqueProviders}</p>,
        <p className="text centered">{item.uniqueClients}</p>,
        <p className="text centered">{item.totalConsultations}</p>,
      ];
    });
  }, [dataToDisplay]);

  const menuOptions = [
    {
      icon: "view",
      text: t("view"),
      handleClick: (id) => navigate(`/sponsor-details?sponsorId=${id}`),
    },
    {
      icon: "edit",
      text: t("edit"),
      handleClick: (id) => {
        console.log(id, "id");
        setOrganizationToEdit(data.find((item) => item.organizationId === id));
        setIsModalOpen(true);
      },
    },
  ];

  const onEditSuccess = () => {
    toast.success(t("organization_edited"));
    setIsModalOpen(false);
    setOrganizationToEdit(null);
    queryClient.invalidateQueries({
      queryKey: ["GetOrganizationsWithDetails"],
    });
  };
  const onEditError = () => {};
  const editOrganizationMutation = useEditOrganization(
    onEditSuccess,
    onEditError
  );

  const onCreateSuccess = () => {
    toast.success(t("organization_added"));
    setIsModalOpen(false);
    setNewOrganizationName("");
    queryClient.invalidateQueries({
      queryKey: ["GetOrganizationsWithDetails"],
    });
  };

  const onCreateError = () => {};
  const createOrganizationMutation = useCreateOrganization(
    onCreateSuccess,
    onCreateError
  );

  const addOrganization = () => {
    createOrganizationMutation.mutate({ name: newOrganizationName });
  };
  const editOrganization = () => {
    editOrganizationMutation.mutate({
      name: organizationToEdit.name,
      organizationId: organizationToEdit.organizationId,
    });
  };

  console.log(organizationToEdit);
  return (
    <React.Fragment>
      <Modal
        isOpen={isModalOpen}
        heading={t(
          organizationToEdit ? "edit_organization" : "create_organization"
        )}
        closeModal={() => setIsModalOpen(false)}
        classes="organizations"
        ctaLabel={organizationToEdit ? t("save") : t("add")}
        ctaHandleClick={organizationToEdit ? editOrganization : addOrganization}
        isCtaLoading={
          editOrganizationMutation.isLoading ||
          createOrganizationMutation.isLoading
        }
      >
        <div className="organizations__modal">
          <Input
            label={t("name")}
            value={
              organizationToEdit ? organizationToEdit.name : newOrganizationName
            }
            onChange={(e) => {
              if (organizationToEdit) {
                setOrganizationToEdit((prev) => ({
                  ...prev,
                  name: e.target.value,
                }));
              } else {
                setNewOrganizationName(e.target.value);
              }
            }}
          />
        </div>
      </Modal>

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
            buttonAction={() => setIsModalOpen(true)}
            // secondaryButtonLabel={t("filter_button")}
            t={t}
          />
        )}
      </Block>
    </React.Fragment>
  );
};
