import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";

import { Backdrop } from "@USupport-components-library/src";
import { useDeleteOrganization } from "#hooks";

/**
 * DeleteOrganization.
 *
 * The DeleteOrganization backdrop
 *
 * @return {jsx}
 */
export const DeleteOrganization = ({ isOpen, onClose, organization }) => {
  const { t } = useTranslation("organizations");

  const queryClient = useQueryClient();

  const [isProvidersOpen, setIsProvidersOpen] = useState(false);
  const [providers, setProviders] = useState([]);

  const onSuccess = () => {
    queryClient.invalidateQueries(["GetOrganizationsWithDetails"]);
    queryClient.invalidateQueries(["organizagtions"]);
    onClose();
    toast(t("delete_success", { name: organization.name }));
  };
  const onError = (error, providers) => {
    toast(error, { type: "error" });
    if (providers) {
      setProviders(providers);
      setIsProvidersOpen(true);
    }
  };
  const deleteOrganizationMutation = useDeleteOrganization(onSuccess, onError);

  const handleDelete = () => {
    deleteOrganizationMutation.mutate(organization.organizationId);
  };

  const renderProviders = () => {
    return providers.map((provider) => (
      <div key={provider.providerDetailId}>
        {provider.name} {provider.surname}
      </div>
    ));
  };

  const handleProvidersClose = () => {
    setIsProvidersOpen(false);
    setProviders([]);
    onClose();
  };

  return (
    <>
      <Backdrop
        title="DeleteOrganization"
        isOpen={isOpen}
        onClose={onClose}
        heading={t("delete_heading", { name: organization.name })}
        text={t("delete_subheading")}
        ctaLabel={t("delete_label")}
        ctaHandleClick={handleDelete}
        secondaryCtaLabel={t("cancel")}
        secondaryCtaHandleClick={onClose}
        secondaryCtaType="secondary"
        ctaColor="red"
      />
      {providers && (
        <Backdrop
          title="DeleteOrganizationProviders"
          isOpen={isProvidersOpen}
          onClose={handleProvidersClose}
          heading={t("delete_providers_heading", { name: organization.name })}
          text={t("delete_providers_subheading")}
          ctaLabel={t("cancel")}
          ctaHandleClick={handleProvidersClose}
        >
          {renderProviders()}
        </Backdrop>
      )}
    </>
  );
};
