import React from "react";
import { useTranslation } from "react-i18next";

import { Backdrop } from "@USupport-components-library/src";
import { mfaSvc } from "@USupport-components-library/services";

export const MfaVerification = ({
  isOpen,
  onClose,
  availableMethods,
  onRetryPasskey,
  onUseEmailCode,
  isPasskeyLoading,
  errorMessage,
}) => {
  const { t } = useTranslation("modals", { keyPrefix: "mfa-verification" });
  const showPasskey = availableMethods.includes("passkey") && mfaSvc.isPasskeySupported();

  return (
    <Backdrop
      classes="mfa-verification"
      title="MfaVerification"
      isOpen={isOpen}
      onClose={onClose}
      heading={t("heading")}
      text={t("subheading")}
      ctaLabel={
        showPasskey ? t("passkey_button_label") : t("email_code_button_label")
      }
      ctaHandleClick={showPasskey ? onRetryPasskey : onUseEmailCode}
      isCtaLoading={showPasskey && isPasskeyLoading}
      secondaryCtaLabel={showPasskey ? t("email_code_button_label") : undefined}
      secondaryCtaHandleClick={showPasskey ? onUseEmailCode : undefined}
      secondaryCtaType="secondary"
      errorMessage={errorMessage}
    />
  );
};
