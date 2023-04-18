import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import PinInput from "react-pin-input";

import { useError } from "#hooks";

import {
  Backdrop,
  ButtonWithIcon,
  Button,
  Error,
} from "@USupport-components-library/src";

import { adminSvc } from "@USupport-components-library/services";

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
  data,
  requestOTP,
  resendTimer,
  showTimer,
  canRequestNewEmail,
  isMutating,
}) => {
  const { t } = useTranslation("code-verification");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isCodeHidden, setIsCodeHidden] = useState(true);
  const [errors, setErrors] = useState({});

  const [code, setCode] = useState("");

  const login = async () => {
    return await adminSvc.login(data.email, data.password, data.role, code);
  };
  const loginMutation = useMutation(login, {
    onSuccess: (response) => {
      const { token: tokenData } = response.data;
      const { token, expiresIn, refreshToken } = tokenData;

      localStorage.setItem("token", token);
      localStorage.setItem("token-expires-in", expiresIn);
      localStorage.setItem("refresh-token", refreshToken);

      queryClient.invalidateQueries({ queryKey: ["provider-data"] });

      setErrors({});
      navigate("/dashboard");
    },
    onError: (err) => {
      const { message: errorMessage } = useError(err);
      setErrors({ submit: errorMessage });
    },
  });

  const handleCodeChange = (value) => {
    setCode(value);
  };

  const handleSend = (e) => {
    e?.preventDefault();
    loginMutation.mutate();
  };

  return (
    <Backdrop
      classes="code-verification"
      title="CodeVerification"
      isOpen={isOpen}
      onClose={onClose}
      heading={t("heading")}
      text={t("subheading")}
    >
      <form onSubmit={handleSend}>
        <div className="code-verification__content">
          <PinInput
            length={4}
            secret={isCodeHidden}
            onChange={(value) => handleCodeChange(value)}
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
          <Button
            label={t("send_button_label")}
            size="lg"
            classes="code-verification__send-button"
            disabled={code.length === 4 ? false : true}
            onClick={handleSend}
            loading={loginMutation.isLoading}
            isSubmit
          />
          {errors.submit && <Error message={errors.submit} />}
          <div className="code-verification__resend-code-container">
            <p className="small-text">{t("didnt_get_code")}</p>

            <Button
              disabled={!canRequestNewEmail || isMutating}
              label={t("resend_code_button_label")}
              type="link"
              classes="code-verification__resend-code-container__button"
              onClick={requestOTP}
            />
            <p className="small-text">
              {showTimer ? t("seconds", { seconds: resendTimer }) : ""}
            </p>
          </div>
        </div>
      </form>
    </Backdrop>
  );
};
