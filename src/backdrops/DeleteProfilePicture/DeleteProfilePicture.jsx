import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Backdrop } from "@USupport-components-library/src";
import { useError } from "#hooks";
import { providerSvc } from "@USupport-components-library/services";

import "./delete-profile-picture.scss";

/**
 * DeleteProfilePicture
 *
 * The DeleteProfilePicture backdrop
 *
 * @return {jsx}
 */
export const DeleteProfilePicture = ({
  isOpen,
  onClose,
  handleDeleteFile,
  providerId,
}) => {
  const { t } = useTranslation("delete-profile-picture");
  const [error, setError] = useState();
  const queryClient = useQueryClient();

  const deletePicture = async () => {
    console.log("del", handleDeleteFile);
    if (handleDeleteFile) {
      handleDeleteFile();
    } else {
      const res = await providerSvc.deleteImageAsAdmin(providerId, providerId);
      console.log(res);
      if (res.status === 200) {
        return true;
      }
    }
  };

  const deletePictureMutation = useMutation(deletePicture, {
    onSuccess: () => {
      queryClient.invalidateQueries(["provider-data"]);
      onClose();
    },
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      setError(errorMessage);
    },
  });

  const handlePictureDelete = () => deletePictureMutation.mutate();

  return (
    <Backdrop
      classes="delete-profile-picture"
      title="DeleteProfilePicture"
      isOpen={isOpen}
      onClose={onClose}
      heading={t("heading")}
      ctaLabel={t("remove_button")}
      ctaHandleClick={handlePictureDelete}
      secondaryCtaLabel={t("cancel_button")}
      secondaryCtaHandleClick={onClose}
      secondaryCtaType="secondary"
      errorMessage={error}
    >
      <p className="delete-profile-picture__text">{t("text")}</p>
    </Backdrop>
  );
};
