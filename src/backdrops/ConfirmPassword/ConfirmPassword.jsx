import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { Backdrop, InputPassword, Error } from "@USupport-components-library/src";

import "./confirm-password.scss";

export const ConfirmPassword = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  errorMessage,
  heading,
  text,
}) => {
  const { t } = useTranslation("modals", { keyPrefix: "confirm-password" });
  const [password, setPassword] = useState("");

  const handleClose = () => {
    setPassword("");
    onClose();
  };

  const handleSubmit = () => {
    onConfirm(password);
  };

  return (
    <Backdrop
      classes="confirm-password"
      title="ConfirmPassword"
      isOpen={isOpen}
      onClose={handleClose}
      heading={heading || t("heading")}
      text={text || t("subheading")}
      ctaLabel={t("confirm_button_label")}
      ctaHandleClick={handleSubmit}
      isCtaLoading={isLoading}
      errorMessage={errorMessage}
    >
      <div className="confirm-password__content">
        <InputPassword
          label={t("password_label")}
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
        />
        {errorMessage && <Error message={errorMessage} />}
      </div>
    </Backdrop>
  );
};
