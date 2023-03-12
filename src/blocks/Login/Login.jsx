import React from "react";
import { useNavigate } from "react-router-dom";
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

import "./login.scss";

/**
 * Login
 *
 * Login block
 *
 * @return {jsx}
 */
export const Login = ({ data, setData, handleLogin, errors, isLoading }) => {
  const { t } = useTranslation("login");
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    const newData = { ...data };

    newData[field] = value;

    setData(newData);
  };

  const handleForgotPassowrd = () => {
    navigate("/forgot-password");
  };

  return (
    <Block classes="login">
      <Grid md={8} lg={12} classes="login__grid">
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
              onClick={() => handleForgotPassowrd()}
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
