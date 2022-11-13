import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { Page, Statistics, Articles, FAQ, SOSCenter } from "#blocks/locales.js";

import {
  NotFound as NotFoundPage,
  Articles as ArticlesPage,
  FAQ as FAQPage,
  SOSCenter as SOSCenterPage,
} from "#pages/locales.js";

const resources = {
  en: {
    // Blocks
    page: Page.en,
    statistics: Statistics.en,
    articles: Articles.en,
    faq: FAQ.en,
    "sos-center": SOSCenter.en,

    // Pages
    "not-found-page": NotFoundPage.en,
    "articles-page": ArticlesPage.en,
    "faq-page": FAQPage.en,
    "sos-center-page": SOSCenterPage.en,
  },
};

i18n.use(initReactI18next).init({
  resources,
  fallbackLng: "en",
  lng: "en",
});

export default i18n;
