import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useWindowDimensions } from "@USupport-components-library/utils";
import { RadialCircle, Loading } from "@USupport-components-library/src";

import { Page, Login as LoginBlock } from "#blocks";

import { useIsLoggedIn } from "#hooks";

import { CodeVerification } from "#backdrops";

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
  const { t } = useTranslation("login-page");
  const { width } = useWindowDimensions();

  const [isCodeVerificationOpen, setIsCodeVerificationOpen] = useState(false);
  const [loginCredentials, setLoginCredentials] = useState();

  const isLoggedIn = useIsLoggedIn();

  if (isLoggedIn === "loading") return <Loading />;
  if (isLoggedIn === true) return <Navigate to="/dashboard" />;

  const handleGoBack = () => navigate("/");

  return (
    <Page
      classes="page__login"
      additionalPadding={false}
      heading={width >= 768 ? t("heading_1") : t("heading_2")}
      handleGoBack={handleGoBack}
    >
      <LoginBlock
        openCodeVerification={() => setIsCodeVerificationOpen(true)}
        setLoginCredentials={(data) => setLoginCredentials(data)}
      />
      {width < 768 && <RadialCircle color="purple" />}
      {isCodeVerificationOpen && (
        <CodeVerification
          isOpen={isCodeVerificationOpen}
          onClose={() => setIsCodeVerificationOpen(false)}
          data={loginCredentials}
        />
      )}
    </Page>
  );
};
