import React, { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import classNames from "classnames";

import { Navbar, Icon, PasswordModal } from "@USupport-components-library/src";
import {
  countrySvc,
  languageSvc,
  userSvc,
} from "@USupport-components-library/services";
import {
  getCountryFromTimezone,
  useWindowDimensions,
} from "@USupport-components-library/utils";
import { useIsLoggedIn, useError, useEventListener } from "#hooks";

import "./page.scss";

const kazakhstanCountry = {
  value: "KZ",
  label: "Kazakhstan",
  iconName: "KZ",
};

/**
 * Page
 *
 * Page wrapper
 *
 * @return {jsx}
 */
export const Page = ({
  additionalPadding,
  showGoBackArrow,
  heading,
  headingButton,
  showNavbar = null,
  classes,
  children,
  handleGoBack,
  showHeadingButtonInline = false,
  showHeadingButtonBelow = true,
  image,
}) => {
  const navigateTo = useNavigate();
  const { t, i18n } = useTranslation("page");

  const isLoggedIn = useIsLoggedIn();
  const isNavbarShown = showNavbar !== null ? showNavbar : isLoggedIn;
  const IS_DEV = process.env.NODE_ENV === "development";

  const { width } = useWindowDimensions();

  const pages = [
    { name: t("page_1"), url: "/dashboard" },
    { name: t("page_2"), url: "/providers" },
    { name: t("page_3"), url: "/articles" },
    { name: t("page_4"), url: "/sos-center" },
    { name: t("page_5"), url: "/faq" },
    { name: t("page_6"), url: "/reports" },
    { name: t("page_7"), url: "/campaigns" },
    { name: t("page_8"), url: "/my-qa" },
    { name: t("page_9"), url: "/organizations" },
  ];

  const localStorageCountry = localStorage.getItem("country");
  const localStorageLanguage = localStorage.getItem("language");
  const [selectedLanguage, setSelectedLanguage] = useState(
    localStorageLanguage ? { value: localStorageLanguage.toUpperCase() } : null
  );
  const [selectedCountry, setSelectedCountry] = useState();
  useEventListener("countryChanged", () => {
    const country = localStorage.getItem("country");
    if (country) {
      setSelectedCountry(country);
    }
  });
  const handleCountrySelection = (countries) => {
    let hasSetDefaultCountry = false;

    const usersCountry = getCountryFromTimezone();
    const validCountry = countries.find((x) => x.value === usersCountry);

    for (let i = 0; i < countries.length; i++) {
      const country = countries[i];

      if (localStorageCountry === country.value) {
        localStorage.setItem("country_id", country.countryID);
        localStorage.setItem("currency_symbol", country.currencySymbol);

        setSelectedCountry(country);
      } else if (!localStorageCountry || localStorageCountry === "undefined") {
        if (validCountry?.value === country.value) {
          hasSetDefaultCountry = true;

          localStorage.setItem("country", country.value);
          localStorage.setItem("country_id", country.countryID);

          localStorage.setItem("currency_symbol", country.currencySymbol);

          setSelectedCountry(country);
        }
      }
    }

    if (!hasSetDefaultCountry && !localStorageCountry) {
      const kazakhstanCountryObject = countries.find(
        (x) => x.value === kazakhstanCountry.value
      );

      localStorage.setItem("country", kazakhstanCountry.value);
      localStorage.setItem("country_id", kazakhstanCountryObject.countryID);

      localStorage.setItem(
        "currency_symbol",
        kazakhstanCountryObject.currencySymbol
      );
    }
  };

  const fetchCountries = async () => {
    const res = await countrySvc.getActiveCountries();

    const countries = res.data.map((x) => {
      const countryObject = {
        value: x.alpha2,
        label: x.name,
        countryID: x["country_id"],
        iconName: x.alpha2,
        minAge: x["min_client_age"],
        maxAge: x["max_client_age"],
        currencySymbol: x["symbol"],
        localName: x.local_name,
      };
      return countryObject;
    });

    handleCountrySelection(countries);

    return countries;
  };
  const fetchLanguages = async () => {
    const res = await languageSvc.getActiveLanguages();
    const languages = res.data.map((x) => {
      const languageObject = {
        value: x.alpha2,
        label: x.name,
        localName: x.local_name,
        id: x.language_id,
      };
      if (localStorageLanguage === x.alpha2) {
        setSelectedLanguage(languageObject);
        i18n.changeLanguage(localStorageLanguage);
      } else if (!localStorageLanguage) {
        localStorage.setItem("language", "en");
        i18n.changeLanguage("en");
      }
      return languageObject;
    });
    return languages;
  };

  const { data: countries } = useQuery(["countries"], fetchCountries, {
    staleTime: Infinity,
  });
  const { data: languages } = useQuery(
    ["languages", selectedCountry],
    fetchLanguages,
    {
      staleTime: Infinity,
      cacheTime: 1000 * 60 * 60 * 24, // Keep cached for 24 hours
      enabled: !!selectedCountry,
    }
  );

  useEffect(() => {
    const countries = queryClient.getQueryData(["countries"]);
    if (countries) {
      handleCountrySelection(countries);
    }
  }, []);

  const queryClient = useQueryClient();

  const hasPassedValidation = queryClient.getQueryData(["hasPassedValidation"]);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(
    IS_DEV ? false : !hasPassedValidation
  );
  const [passwordError, setPasswordError] = useState("");

  const validatePlatformPasswordMutation = useMutation(
    async (value) => {
      return await userSvc.validatePlatformPassword(value);
    },
    {
      onError: (error) => {
        const { message: errorMessage } = useError(error);
        setPasswordError(errorMessage);
      },
      onSuccess: () => {
        queryClient.setQueryData(["hasPassedValidation"], true);
        setIsPasswordModalOpen(false);
      },
    }
  );

  const handlePasswordCheck = (value) => {
    validatePlatformPasswordMutation.mutate(value);
  };
  return (
    <>
      <PasswordModal
        label={t("password")}
        btnLabel={t("submit")}
        isOpen={isPasswordModalOpen}
        isLoading={validatePlatformPasswordMutation.isLoading}
        error={passwordError}
        handleSubmit={handlePasswordCheck}
        placeholder={t("password_placeholder")}
      />

      {isNavbarShown === true && (
        <Navbar
          pages={pages}
          showProfile
          yourProfileText={t("your_profile_text")}
          showProfilePicture={false}
          showNotifications={false}
          i18n={i18n}
          navigate={navigateTo}
          NavLink={NavLink}
          languages={languages}
          countries={countries}
          initialLanguage={selectedLanguage}
          initialCountry={selectedCountry}
          renderIn="country-admin"
        />
      )}
      <div
        className={[
          "page",
          `${additionalPadding ? "" : "page--no-additional-top-padding"}`,
          `${classNames(classes)}`,
        ].join(" ")}
      >
        {(heading || showGoBackArrow || headingButton) && (
          <>
            <div
              className={[
                "page__header",
                showHeadingButtonBelow &&
                  !width >= 768 &&
                  "page__header__button-below",
              ].join(" ")}
            >
              {showGoBackArrow && (
                <Icon
                  classes="page__header-icon"
                  name="arrow-chevron-back"
                  size="md"
                  color="#20809E"
                  onClick={handleGoBack}
                />
              )}
              {image && <img className="page__header__image" src={image} />}
              {heading && <h3 className="page__header-heading">{heading}</h3>}
              {headingButton && (width >= 768 || showHeadingButtonInline) && (
                <div className="page__header-button-container">
                  {headingButton}
                </div>
              )}
            </div>
            {headingButton && (
              <div className="page__mobile-button-container">
                {width < 768 &&
                !showHeadingButtonInline &&
                headingButton &&
                showHeadingButtonBelow
                  ? headingButton
                  : null}
              </div>
            )}
          </>
        )}

        {children}
      </div>
    </>
  );
};

Page.propTypes = {
  /**
   * Additional padding on top of the page
   */
  additionalPadding: PropTypes.bool,

  /**
   * Show the navbar
   */
  showNavbar: PropTypes.bool,

  /**
   * Show the go back arrow
   */
  showGoBackArrow: PropTypes.bool,

  /**
   * Heading text
   */
  heading: PropTypes.string,

  /**
   * Heading button
   */
  headingButton: PropTypes.node,

  /**
   * Additional classes
   */
  classes: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
};

Page.defaultProps = {
  additionalPadding: true,
  showGoBackArrow: true,
};
