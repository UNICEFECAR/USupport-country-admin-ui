import React from "react";
import { useCustomNavigate as useNavigate } from "#hooks";
import { useTranslation } from "react-i18next";
import {
  Block,
  Error,
  Input,
  Grid,
  GridItem,
  InputPassword,
  Button,
} from "@USupport-components-library/src";
import { logoVerticalSvg } from "@USupport-components-library/assets";

import "./login.scss";

/**
 * Login
 *
 * Login block
 *
 * @return {jsx}
 */
export const Login = ({ data, setData, handleLogin, errors, isLoading }) => {
  const { t } = useTranslation("blocks", { keyPrefix: "login" });
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    const newData = { ...data };

    newData[field] = value;

    setData(newData);
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  return (
    <Block classes="login">
      <Grid md={8} lg={12} classes="login__grid">
        <GridItem md={8} lg={12} classes="login__grid__inputs-item">
          <div className="login__grid__logo">
            <h2 className="welcome__grid__logo-item__heading">
              {t("heading")}
            </h2>
            <img
              src={logoVerticalSvg}
              alt="Logo"
              className="welcome__grid__logo-item__logo"
            />
            <h2 className="welcome__grid__logo-item__heading">{t("admin")}</h2>
          </div>
        </GridItem>
        <GridItem md={8} lg={12} classes="login__grid__inputs-item">
          <form onSubmit={handleLogin}>
            <Input
              label={t("email_label")}
              onChange={(value) =>
                handleChange("email", value.currentTarget.value)
              }
              placeholder={t("email_placeholder")}
              value={data.email}
            />
            <InputPassword
              classes="login__grid__inputs-item__input--password"
              label={t("password_label")}
              onChange={(value) =>
                handleChange("password", value.currentTarget.value)
              }
              placeholder={t("password_placeholder")}
              value={data.password}
            />
            <Button
              type="ghost"
              color="purple"
              classes="login__grid__forgot-password"
              label={t("forgot_password_label")}
              onClick={() => handleForgotPassword()}
            />
            {errors.submit ? <Error message={errors.submit} /> : null}
            <Button
              label={t("login_label")}
              size="lg"
              classes="login-button"
              disabled={!data.email || !data.password}
              isSubmit
              loading={isLoading}
            />
          </form>
        </GridItem>
      </Grid>
    </Block>
  );
};
