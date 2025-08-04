import React, { useState, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
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
  targetImage,
  fileName,
  setTargetImageUrl,
  providerId,
}) => {
  const { t } = useTranslation("modals", { keyPrefix: "upload-picture" });

  const [image, setImage] = useState(
    AMAZON_S3_BUCKET + "/" + (targetImage || "default")
  );
  const [error, setError] = useState();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setImage(AMAZON_S3_BUCKET + "/" + (targetImage || "default"));
  }, [targetImage]);

  const uploadFile = async (data) => {
    if (handleUploadFile) {
      handleUploadFile(data);
    } else {
      const content = new FormData();
      content.append("fileName", fileName);
      content.append("fileContent", data.imageFile);

      await userSvc.uploadFileAsAdmin(content);
      if (providerId) {
        await providerSvc.changeImageAsAdmin(providerId, providerId);
      }
      setTargetImageUrl(data.imageAsUrl);
      toast(t("upload_success"));
    }
    return true;
  };

  const uploadFileMutation = useMutation(uploadFile, {
    onSuccess: () => {
      setIsLoading(false);
      onClose();
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
    reader.onabort = () => setError(t("upload_error"));
    reader.onerror = () => setError(t("upload_error"));
    reader.readAsDataURL(files[0]);

    const sizeInKB = files[0].size / 1000;
    if (sizeInKB > 1000) {
      setError(t("file_size_error"));
      setIsLoading(false);
      return;
    }

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
