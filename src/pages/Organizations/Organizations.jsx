import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { Page, Organizations as OrganizationsBlock } from "#blocks";
import { CreateOrganization } from "#backdrops";
import { Button } from "@USupport-components-library/src";

import "./organizations.scss";

/**
 * Organizations
 *
 * Page to display organizations
 *
 * @returns {JSX.Element}
 */
export const Organizations = () => {
  const { t } = useTranslation("organizations-page");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [organizationToEdit, setOrganizationToEdit] = useState(null);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setOrganizationToEdit(null);
  };

  const handleAddOrganization = () => {
    setOrganizationToEdit(null);
    setIsModalOpen(true);
  };

  return (
    <Page
      heading={t("heading")}
      headingButton={
        <Button
          label={t("add_button")}
          onClick={handleAddOrganization}
          type="secondary"
          color="purple"
        />
      }
      showHeadingButtonInline
      showGoBackArrow={false}
      classes="page__organizations"
    >
      <CreateOrganization
        isOpen={isModalOpen}
        onClose={handleModalClose}
        organizationToEdit={organizationToEdit}
      />
      <OrganizationsBlock
        setIsModalOpen={setIsModalOpen}
        setOrganizationToEdit={setOrganizationToEdit}
      />
    </Page>
  );
};
