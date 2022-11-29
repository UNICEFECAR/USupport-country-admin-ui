import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Backdrop, Loading } from "@USupport-components-library/src";
import { userSvc, providerSvc } from "@USupport-components-library/services";
import { useError } from "#hooks";

const AMAZON_S3_BUCKET = `${import.meta.env.VITE_AMAZON_S3_BUCKET}`;

import "./upload-picture.scss";

/**
 * UploadPicture
 *
 * The UploadPicture backdrop
 *
 * @return {jsx}
 */
export const UploadPicture = ({
  isOpen,
  onClose,
  handleUploadFile,
  providerImage,
  providerId,
  setProviderImageUrl,
}) => {
  const { t } = useTranslation("upload-picture");

  const [image, setImage] = useState(
    AMAZON_S3_BUCKET + "/" + (providerImage || "default")
  );
  const [error, setError] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const uploadFile = async (data) => {
    if (handleUploadFile) {
      handleUploadFile(data);
    } else {
      const content = new FormData();
      content.append("fileName", providerId);
      content.append("fileContent", data.imageFile);
      await Promise.all[
        (userSvc.uploadFileAsAdmin(content),
        providerSvc.changeImageAsAdmin(providerId, providerId))
      ];
      setProviderImageUrl(data.imageAsUrl);
    }
    return true;
  };

  const uploadFileMutation = useMutation(uploadFile, {
    onSuccess: () => {
      setIsLoading(false);
    },
    onError: (error) => {
      setIsLoading(false);
      const { message: errorMessage } = useError(error);
      setError(errorMessage);
    },
  });

  const onDrop = useCallback((files) => {
    setIsLoading(true);

    const reader = new FileReader();
    reader.onabort = () => console.log("file reading was aborted");
    reader.onerror = () => console.log("file reading has failed");
    reader.readAsDataURL(files[0]);

    reader.onload = (e) => {
      setImage(e.target.result);
      uploadFileMutation.mutate({
        imageAsUrl: e.target.result,
        imageFile: files[0],
      });
    };
  });

  const { getRootProps, getInputProps, inputRef } = useDropzone({
    onDrop,
  });

  return (
    <Backdrop
      classes="upload-picture"
      title="UploadPicture"
      isOpen={isOpen}
      onClose={onClose}
      heading={t("heading")}
      ctaLabel={t("upload")}
      ctaHandleClick={() => {
        inputRef.current?.click();
      }}
      errorMessage={error}
    >
      <form>
        <div className="upload-picture__content" {...getRootProps()}>
          {isLoading ? (
            <Loading padding="6rem" size="lg" />
          ) : (
            <img
              className="upload-picture__content__image-preview"
              src={image}
            />
          )}
          <p className="upload-picture__content__drag-text">
            {t("drag_and_drop")}
          </p>
          <p>{t("or")}</p>
          <input
            type="file"
            accept="image/*"
            className="upload-picture__content__file-input"
            {...getInputProps()}
          />
        </div>
      </form>
    </Backdrop>
  );
};
