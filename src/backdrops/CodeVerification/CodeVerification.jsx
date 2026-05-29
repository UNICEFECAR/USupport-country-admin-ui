import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate as useRawNavigate } from "react-router-dom";
import { PinInput } from "@USupport-components-library/src";

import { useCustomNavigate as useNavigate, useError } from "#hooks";

import { Backdrop, ButtonWithIcon, Button } from "@USupport-components-library/src";

import { mfaSvc } from "@USupport-components-library/services";

import "./code-verification.scss";

/**
 * CodeVerification
 *
 * The CodeVerification backdrop
 *
 * @return {jsx}
 */
export const CodeVerification = ({
  isOpen,
  onClose,
  mfaSessionId,
  requestOTP,
  resendTimer,
  showTimer,
  canRequestNewEmail,
  nextPath,
}) => {
  const { t } = useTranslation("modals", { keyPrefix: "code-verification" });
  const navigate = useNavigate();
  const rawNavigate = useRawNavigate();
  const queryClient = useQueryClient();

  const [isCodeHidden, setIsCodeHidden] = useState(true);
  const [errors, setErrors] = useState({});
  const [code, setCode] = useState("");

  const verifyEmailMfa = async () => {
    return await mfaSvc.emailMfaVerify(mfaSessionId, code);
  };

  const verifyMutation = useMutation(verifyEmailMfa, {
    onSuccess: (response) => {
      const { token: tokenData } = response.data;
      const { token, expiresIn, refreshToken } = tokenData;

      localStorage.setItem("token", token);
      localStorage.setItem("token-expires-in", expiresIn);
      localStorage.setItem("refresh-token", refreshToken);

      queryClient.invalidateQueries({ queryKey: ["provider-data"] });
      window.dispatchEvent(new Event("login"));

      setErrors({});
      if (nextPath && nextPath.startsWith("/country-admin/")) {
        rawNavigate(nextPath);
        return;
      }
      navigate("/dashboard");
    },
    onError: (err) => {
      const { message: errorMessage } = useError(err);
      setErrors({ submit: errorMessage });
    },
  });

  const resendMutation = useMutation(requestOTP, {
    onSuccess: () => {
      setErrors({});
    },
    onError: (err) => {
      const { message: errorMessage } = useError(err);
      setErrors({ submit: errorMessage });
    },
  });

  const handleSend = (e) => {
    e?.preventDefault();
    verifyMutation.mutate();
  };

  return (
    <Backdrop
      classes="code-verification"
      title="CodeVerification"
      isOpen={isOpen}
      onClose={onClose}
      heading={t("heading")}
      text={t("subheading")}
      ctaLabel={t("send_button_label")}
      ctaHandleClick={handleSend}
      isCtaDisabled={code.length !== 4}
      isCtaLoading={verifyMutation.isLoading}
      errorMessage={errors.submit}
    >
      <div className="code-verification__content">
        <PinInput
          length={4}
          secret={isCodeHidden}
          onChange={(value) => setCode(value)}
        />
        <ButtonWithIcon
          classes="code-verification__view-code-button"
          type="ghost"
          color="purple"
          iconName={isCodeHidden ? "view" : "hide"}
          iconColor="#9749FA"
          label={
            isCodeHidden
              ? t("button_with_icon_label_view")
              : t("button_with_icon_label_hide")
          }
          onClick={() => setIsCodeHidden(!isCodeHidden)}
        />
        <div className="code-verification__resend-code-container">
          <p className="small-text">{t("didnt_get_code")}</p>

          <Button
            disabled={!canRequestNewEmail || resendMutation.isLoading}
            label={t("resend_code_button_label")}
            type="link"
            classes="code-verification__resend-code-container__button"
            onClick={() => resendMutation.mutate()}
          />
          <p className="small-text">
            {showTimer ? t("seconds", { seconds: resendTimer }) : ""}
          </p>
        </div>
      </div>
    </Backdrop>
  );
};
