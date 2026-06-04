/* eslint-disable */
import React, { useState } from "react";
import {
  Navigate,
  useSearchParams,
  useNavigate as useRawNavigate,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useWindowDimensions } from "@USupport-components-library/utils";
import { RadialCircle, Loading } from "@USupport-components-library/src";
import { mfaSvc } from "@USupport-components-library/services";

import { Page, Login as LoginBlock } from "#blocks";

import {
  useIsLoggedIn,
  useError,
  useCustomNavigate as useNavigate,
} from "#hooks";

import { CodeVerification, MfaVerification } from "#backdrops";

import "./login.scss";

/**
 * Login
 *
 * Login page
 *
 * @returns {JSX.Element}
 */
export const Login = () => {
  const navigate = useNavigate();
  const rawNavigate = useRawNavigate();
  const { t } = useTranslation("pages", { keyPrefix: "login-page" });
  const { width } = useWindowDimensions();
  const [searchParams] = useSearchParams();
  const nextPath = searchParams.get("next");
  const queryClient = useQueryClient();

  const ROLE = "country";

  const [isMfaVerificationOpen, setIsMfaVerificationOpen] = useState(false);
  const [isCodeVerificationOpen, setIsCodeVerificationOpen] = useState(false);
  const [mfaSessionId, setMfaSessionId] = useState(null);
  const [availableMethods, setAvailableMethods] = useState([]);
  const [isPasskeyAttemptLoading, setIsPasskeyAttemptLoading] = useState(false);

  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const [showTimer, setShowTimer] = useState(false);
  const [canRequestNewEmail, setCanRequestNewEmail] = useState(false);
  const [seconds, setSeconds] = useState(60);

  const isLoggedIn = useIsLoggedIn();

  const disableLoginButtonFor60Sec = () => {
    setShowTimer(true);
    const interval = setInterval(() => {
      setSeconds((sec) => {
        if (sec - 1 === 0) {
          clearInterval(interval);
          setShowTimer(false);
          setSeconds(60);
          setCanRequestNewEmail(true);
        }
        return sec - 1;
      });
    }, 1000);
  };

  const storeTokensAndNavigate = (response) => {
    window.dispatchEvent(new Event("login"));

    const { token: tokenData } = response.data;
    const { token, expiresIn, refreshToken } = tokenData;

    localStorage.setItem("token", token);
    localStorage.setItem("token-expires-in", expiresIn);
    localStorage.setItem("refresh-token", refreshToken);

    queryClient.invalidateQueries({ queryKey: ["provider-data"] });

    setErrors({});
    if (nextPath && nextPath.startsWith("/country-admin/")) {
      rawNavigate(nextPath);
    } else {
      navigate("/dashboard");
    }
  };

  const requestEmailMfa = async (sessionId) => {
    await mfaSvc.emailMfaRequest(sessionId);
    setIsMfaVerificationOpen(false);
    setIsCodeVerificationOpen(true);
    disableLoginButtonFor60Sec();
    setCanRequestNewEmail(false);
  };

  const attemptPasskeyMfa = async (sessionId) => {
    setIsPasskeyAttemptLoading(true);
    try {
      const response = await mfaSvc.completePasskeyMfa(sessionId);
      storeTokensAndNavigate(response);
    } catch (error) {
      if (error?.name === "NotAllowedError") {
        setIsMfaVerificationOpen(true);
        return;
      }
      const { message: errorMessage } = useError(error);
      setErrors({ submit: errorMessage });
      setIsMfaVerificationOpen(true);
    } finally {
      setIsPasskeyAttemptLoading(false);
    }
  };

  const credentialsLogin = async () => {
    return await mfaSvc.loginCredentials(
      data.email.toLowerCase(),
      data.password.trim(),
      ROLE
    );
  };

  const credentialsMutation = useMutation(credentialsLogin, {
    onSuccess: (response) => {
      setErrors({});

      if (!response.data.mfaRequired) {
        storeTokensAndNavigate(response);
        return;
      }

      const { mfaSessionId: sessionId, availableMethods: methods } =
        response.data;
      setMfaSessionId(sessionId);
      setAvailableMethods(methods);

      if (methods.includes("passkey") && mfaSvc.isPasskeySupported()) {
        attemptPasskeyMfa(sessionId);
      } else {
        requestEmailMfa(sessionId).catch((error) => {
          const { message: errorMessage } = useError(error);
          setErrors({ submit: errorMessage });
        });
      }
    },
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      setErrors({ submit: errorMessage });
    },
  });

  if (isLoggedIn === "loading") return <Loading />;
  if (isLoggedIn === true) {
    const redirectTo =
      nextPath && nextPath.startsWith("/country-admin/")
        ? nextPath
        : `/country-admin/${localStorage.getItem("language")}/dashboard`;
    return <Navigate to={redirectTo} replace />;
  }

  const handleGoBack = () => navigate("/");

  const handleLogin = (e) => {
    e.preventDefault();
    credentialsMutation.mutate();
  };

  const handleUseEmailCode = () => {
    requestEmailMfa(mfaSessionId).catch((error) => {
      const { message: errorMessage } = useError(error);
      setErrors({ submit: errorMessage });
    });
  };

  const handleRetryPasskey = () => {
    attemptPasskeyMfa(mfaSessionId);
  };

  const resendEmailMfa = async () => {
    await mfaSvc.emailMfaRequest(mfaSessionId);
    disableLoginButtonFor60Sec();
    setCanRequestNewEmail(false);
  };

  return (
    <Page
      classes="page__login"
      additionalPadding={false}
      heading={width >= 768 ? t("heading_1") : t("heading_2")}
      handleGoBack={handleGoBack}
    >
      <LoginBlock
        data={data}
        setData={setData}
        handleLogin={handleLogin}
        errors={errors}
        showTimer={showTimer}
        isLoading={
          credentialsMutation.isLoading ||
          isPasskeyAttemptLoading
        }
      />
      {width < 768 && <RadialCircle color="purple" />}
      {isMfaVerificationOpen && (
        <MfaVerification
          isOpen={isMfaVerificationOpen}
          onClose={() => setIsMfaVerificationOpen(false)}
          availableMethods={availableMethods}
          onRetryPasskey={handleRetryPasskey}
          onUseEmailCode={handleUseEmailCode}
          isPasskeyLoading={isPasskeyAttemptLoading}
          errorMessage={errors.submit}
        />
      )}
      {isCodeVerificationOpen && (
        <CodeVerification
          isOpen={isCodeVerificationOpen}
          onClose={() => setIsCodeVerificationOpen(false)}
          mfaSessionId={mfaSessionId}
          requestOTP={resendEmailMfa}
          canRequestNewEmail={canRequestNewEmail}
          resendTimer={seconds}
          showTimer={showTimer}
          nextPath={nextPath}
        />
      )}
    </Page>
  );
};
