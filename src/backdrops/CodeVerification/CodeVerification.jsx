import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import PinInput from "react-pin-input";

import {
  Backdrop,
  ButtonWithIcon,
  Button,
  Error,
} from "@USupport-components-library/src";

import { adminSvc } from "@USupport-components-library/services";

import {
  useCountdownTimer,
  useError,
} from "@USupport-components-library/hooks";

import "./code-verification.scss";

/**
 * CodeVerification
 *
 * The CodeVerification backdrop
 *
 * @return {jsx}
 */
export const CodeVerification = ({ isOpen, onClose, data }) => {
  const { t } = useTranslation("code-verification");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isCodeHidden, setIsCodeHidden] = useState(true);
  const [canRequestNewEmail, setCanRequestNewEmail] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState();

  const timeToRequestNewEmail = useCountdownTimer(3);
  useEffect(() => {
    if (timeToRequestNewEmail[2] === 0 && timeToRequestNewEmail[3] === 0) {
      setCanRequestNewEmail(true);
    }
  }, [timeToRequestNewEmail]);

  const time = useCountdownTimer();
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
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const handleCodeChange = (value) => {
    setCode(value);
  };

  const handleSend = () => {
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
      <div className="code-verification__content">
        <PinInput
          length={4}
          secret={isCodeHidden}
          onChange={(value) => handleCodeChange(value)}
        />
        <p className="small-text code-verification__expire-time-text">
          {t("expiration_text")} {time[2]}:
          {time[3] > 9 ? time[3] : "0" + time[3]}
        </p>
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
        />
        {errors.submit && <Error message={errors.submit} />}
        <div className="code-verification__resend-code-container">
          <p className="small-text">{t("didnt_get_code")}</p>
          <Button
            disabled={!canRequestNewEmail}
            label={t("resend_code_button_label")}
            type="link"
            classes="code-verification__resend-code-container__button"
            onClick={handleSend}
          />
        </div>
      </div>
    </Backdrop>
  );
};
