import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { Page } from "#blocks/locales.js";

import { NotFound as NotFoundPage } from "#pages/locales.js";

const resources = {
  en: {
    // Blocks
    page: Page.en,

    // Pages
    "not-found-page": NotFoundPage.en,
  },
};

i18n.use(initReactI18next).init({
  resources,
  fallbackLng: "en",
  lng: "en",
});

export default i18n;
