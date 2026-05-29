import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import {
  Block,
  Box,
  Button,
  Error,
  Grid,
  GridItem,
  Icon,
  Input,
  Loading,
  Toggle,
} from "@USupport-components-library/src";
import { mfaSvc } from "@USupport-components-library/services";

import { useError } from "#hooks";
import { ConfirmPassword } from "#backdrops";

import "./security-settings.scss";

export const SecuritySettings = () => {
  const { t } = useTranslation("blocks", { keyPrefix: "security-settings" });
  const { t: tPage } = useTranslation("pages", {
    keyPrefix: "security-settings-page",
  });
  const queryClient = useQueryClient();

  const [pendingEnabled, setPendingEnabled] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmError, setConfirmError] = useState("");
  const [passkeyName, setPasskeyName] = useState("");
  const [passkeyError, setPasskeyError] = useState("");

  const settingsQuery = useQuery({
    queryKey: ["mfa-settings"],
    queryFn: async () => {
      const response = await mfaSvc.getMfaSettings();
      return response.data;
    },
  });

  const passkeysQuery = useQuery({
    queryKey: ["mfa-passkeys"],
    queryFn: async () => {
      const response = await mfaSvc.listPasskeys();
      return response.data;
    },
    enabled: Boolean(settingsQuery.data?.mfaEnabled),
  });

  const updateSettingsMutation = useMutation(
    ({ enabled, password }) => mfaSvc.updateMfaSettings(enabled, password),
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ["mfa-settings"] });
        toast(variables.enabled ? t("enable_success") : t("disable_success"));
        setIsConfirmOpen(false);
        setPendingEnabled(null);
        setConfirmError("");
      },
      onError: (error) => {
        const { message: errorMessage } = useError(error);
        setConfirmError(errorMessage);
      },
    },
  );

  const getPasskeyErrorMessage = (error) => {
    if (error?.name === "NotAllowedError") {
      return t("passkey_cancelled");
    }

    const apiError = useError(error);
    if (apiError?.message) {
      return apiError.message;
    }

    if (error?.message) {
      return error.message;
    }

    return t("passkey_add_failed");
  };

  const registerPasskeyMutation = useMutation(
    () => mfaSvc.registerPasskey(passkeyName || t("default_passkey_name")),
    {
      onMutate: () => {
        setPasskeyError("");
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["mfa-passkeys"] });
        queryClient.invalidateQueries({ queryKey: ["mfa-settings"] });
        setPasskeyName("");
        setPasskeyError("");
        toast.success(t("passkey_added_success"));
      },
      onError: (error) => {
        const errorMessage = getPasskeyErrorMessage(error);
        setPasskeyError(errorMessage);
        toast.error(errorMessage);
      },
    },
  );

  const deletePasskeyMutation = useMutation(
    (passkeyId) => mfaSvc.deletePasskey(passkeyId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["mfa-passkeys"] });
        queryClient.invalidateQueries({ queryKey: ["mfa-settings"] });
        toast(t("passkey_removed_success"));
      },
      onError: (error) => {
        const { message: errorMessage } = useError(error);
        toast.error(errorMessage);
      },
    },
  );

  if (settingsQuery.isLoading) {
    return <Loading size="lg" />;
  }

  const mfaEnabled = Boolean(settingsQuery.data?.mfaEnabled);
  const passkeySupported =
    mfaSvc.isPasskeySupported() && settingsQuery.data?.passkeySupported;
  const passkeys = passkeysQuery.data || [];

  const handleToggle = (nextValue) => {
    setPendingEnabled(nextValue);
    setConfirmError("");
    setIsConfirmOpen(true);
  };

  const handleConfirmPassword = (password) => {
    updateSettingsMutation.mutate({
      enabled: pendingEnabled,
      password,
    });
  };

  return (
    <Block classes="security-settings">
      <Grid classes="security-settings__grid">
        <GridItem md={8} lg={12} classes="security-settings__grid__item">
          <div className="security-settings__sections">
            <Box boxShadow={3} classes="security-settings__section">
              <p className="paragraph security-settings__section-title">
                {t("two_factor_heading")}
              </p>
              <p className="text security-settings__section-help">
                {t("two_factor_help")}
              </p>

              <div className="security-settings__setting-row">
                <div className="security-settings__setting-row__content">
                  <p className="text security-settings__setting-row__label">
                    {t("two_factor_toggle_label")}
                  </p>
                  <p
                    className={[
                      "text",
                      "security-settings__status",
                      mfaEnabled
                        ? "security-settings__status--enabled"
                        : "security-settings__status--disabled",
                    ].join(" ")}
                  >
                    {mfaEnabled
                      ? t("two_factor_status_enabled")
                      : t("two_factor_status_disabled")}
                  </p>
                </div>
                <Toggle
                  isToggled={mfaEnabled}
                  setParentState={handleToggle}
                  shouldChangeState={false}
                />
              </div>
            </Box>

            {mfaEnabled && (
              <Box boxShadow={3} classes="security-settings__section">
                <p className="paragraph security-settings__section-title">
                  {t("passkeys_heading")}
                </p>
                <p className="text security-settings__section-help">
                  {passkeySupported
                    ? t("passkeys_help")
                    : t("passkeys_unsupported")}
                </p>

                {passkeysQuery.isLoading ? (
                  <Loading size="md" />
                ) : (
                  <>
                    <div className="security-settings__passkey-list">
                      {passkeys.length === 0 ? (
                        <p className="text security-settings__passkey-empty">
                          {t("passkeys_empty")}
                        </p>
                      ) : (
                        passkeys.map((passkey) => (
                          <div
                            key={passkey.passkeyId}
                            className="security-settings__passkey-item"
                          >
                            <div className="security-settings__passkey-item__icon">
                              <Icon
                                name="fingerprint"
                                size="md"
                                color="#20809E"
                              />
                            </div>
                            <div className="security-settings__passkey-item__info">
                              <p className="text security-settings__passkey-item__name">
                                {passkey.name || t("default_passkey_name")}
                              </p>
                              {passkey.lastUsedAt && (
                                <p className="text">
                                  {t("last_used", {
                                    date: new Date(
                                      passkey.lastUsedAt,
                                    ).toLocaleDateString(),
                                  })}
                                </p>
                              )}
                            </div>
                            <Button
                              label={t("remove_passkey")}
                              type="secondary"
                              size="lg"
                              onClick={() =>
                                deletePasskeyMutation.mutate(passkey.passkeyId)
                              }
                              loading={deletePasskeyMutation.isLoading}
                            />
                          </div>
                        ))
                      )}
                    </div>

                    {passkeySupported && (
                      <div className="security-settings__add-passkey">
                        <p className="paragraph security-settings__add-passkey__label">
                          {t("add_passkey_heading")}
                        </p>
                        <Input
                          label={t("passkey_name_label")}
                          placeholder={t("passkey_name_placeholder")}
                          value={passkeyName}
                          onChange={(e) =>
                            setPasskeyName(e.currentTarget.value)
                          }
                          disabled={registerPasskeyMutation.isLoading}
                          classes="security-settings__passkey-name-input"
                        />
                        {registerPasskeyMutation.isLoading && (
                          <p className="text security-settings__section-help">
                            {t("passkey_registering")}
                          </p>
                        )}
                        {passkeyError ? <Error message={passkeyError} /> : null}
                        <div className="security-settings__add-passkey__button">
                          <Button
                            label={t("add_passkey")}
                            type="primary"
                            size="lg"
                            onClick={() => registerPasskeyMutation.mutate()}
                            loading={registerPasskeyMutation.isLoading}
                            disabled={registerPasskeyMutation.isLoading}
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </Box>
            )}
          </div>
        </GridItem>
      </Grid>

      <ConfirmPassword
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setPendingEnabled(null);
          setConfirmError("");
        }}
        onConfirm={handleConfirmPassword}
        isLoading={updateSettingsMutation.isLoading}
        errorMessage={confirmError}
        heading={
          pendingEnabled
            ? t("enable_confirm_heading")
            : t("disable_confirm_heading")
        }
        text={
          pendingEnabled ? t("enable_confirm_text") : t("disable_confirm_text")
        }
      />
    </Block>
  );
};
