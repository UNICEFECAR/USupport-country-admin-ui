import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import {
  Page,
  Statistics,
  Articles,
  FAQ,
  SOSCenter,
  Login,
  Welcome,
  ForgotPassword,
  ResetPassword,
  AdminProfile,
  EditProfileDetails,
} from "#blocks/locales.js";

import {
  NotFound as NotFoundPage,
  Articles as ArticlesPage,
  FAQ as FAQPage,
  SOSCenter as SOSCenterPage,
  Dashboard as DashboardPage,
  Login as LoginPage,
  ForgotPassword as ForgotPasswordPage,
  ResetPassword as ResetPasswordPage,
  AdminProfile as AdminProfilePage,
  EditProfileDetails as EditProfileDetailsPage,
} from "#pages/locales.js";

const resources = {
  en: {
    // Blocks
    page: Page.en,
    statistics: Statistics.en,
    articles: Articles.en,
    faq: FAQ.en,
    "sos-center": SOSCenter.en,
    login: Login.en,
    welcome: Welcome.en,
    "forgot-password": ForgotPassword.en,
    "reset-password": ResetPassword.en,
    "admin-profile": AdminProfile.en,
    "edit-profile-details": EditProfileDetails.en,

    // Pages
    "not-found-page": NotFoundPage.en,
    "articles-page": ArticlesPage.en,
    "faq-page": FAQPage.en,
    "sos-center-page": SOSCenterPage.en,
    dashboard: DashboardPage.en,
    "login-page": LoginPage.en,
    "forgot-password-page": ForgotPasswordPage.en,
    "reset-password-page": ResetPasswordPage.en,
    "admin-profile-page": AdminProfilePage.en,
    "edit-profile-details-page": EditProfileDetailsPage.en,
  },
};

i18n.use(initReactI18next).init({
  resources,
  fallbackLng: "en",
  lng: "en",
});

export default i18n;
