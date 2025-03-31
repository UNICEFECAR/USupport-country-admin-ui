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
  Providers,
  EditProvider,
  ProviderOverview,
  SecurityCheck,
  InformationPortalSuggestions,
  ClientRatings,
  ContactForms,
  ProviderActivities,
  Campaigns,
  AddSponsor,
  SponsorDetails,
  AddCampaign,
  CampaignDetails,
  MyQAReports,
  MyQA,
  Organizations,
} from "#blocks/locales.js";

import {
  NotFound as NotFoundPage,
  Articles as ArticlesPage,
  FAQ as FAQPage,
  SOSCenter as SOSCenterPage,
  Login as LoginPage,
  ForgotPassword as ForgotPasswordPage,
  ResetPassword as ResetPasswordPage,
  AdminProfile as AdminProfilePage,
  EditProfileDetails as EditProfileDetailsPage,
  ArticleInformation as ArticleInformationPage,
  CreateProvider as CreateProviderPage,
  ProviderOverview as ProviderOverviewPage,
  Reports as ReportsPage,
  Campaigns as CampaignsPage,
  AddSponsor as AddSponsorPage,
  AddCampaign as AddCampaignPage,
  EditCampaign as EditCampaignPage,
  EditSponsor as EditSponsorPage,
  MyQA as MyQAPage,
  Dashboard,
  Providers as ProvidersPage,
  Organizations as OrganizationsPage,
  OrganizationDetails as OrganizationDetailsPage,
} from "#pages/locales.js";

import {
  UploadPicture,
  DeleteProfilePicture,
  FilterSecurityCheckReports,
  CodeVerification,
  QuestionDetails,
  FilterQuestions,
  ChangePassword,
} from "#backdrops/locales.js";

import { Root } from "#routes/locales.js";

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
    providers: Providers.en,
    "edit-provider": EditProvider.en,
    "provider-overview": ProviderOverview.en,
    "security-check": SecurityCheck.en,
    "information-portal-suggestions": InformationPortalSuggestions.en,
    "client-ratings": ClientRatings.en,
    "contact-forms": ContactForms.en,
    "provider-activities": ProviderActivities.en,
    campaigns: Campaigns.en,
    "add-sponsor": AddSponsor.en,
    "sponsor-details": SponsorDetails.en,
    "add-campaign": AddCampaign.en,
    "campaign-details": CampaignDetails.en,
    "my-qa-reports": MyQAReports.en,
    "my-qa": MyQA.en,
    organizations: Organizations.en,

    // Pages
    "not-found-page": NotFoundPage.en,
    "articles-page": ArticlesPage.en,
    "faq-page": FAQPage.en,
    "sos-center-page": SOSCenterPage.en,
    "login-page": LoginPage.en,
    "forgot-password-page": ForgotPasswordPage.en,
    "reset-password-page": ResetPasswordPage.en,
    "admin-profile-page": AdminProfilePage.en,
    "edit-profile-details-page": EditProfileDetailsPage.en,
    "article-information-page": ArticleInformationPage.en,
    "create-provider-page": CreateProviderPage.en,
    "provider-overview-page": ProviderOverviewPage.en,
    "reports-page": ReportsPage.en,
    "campaigns-page": CampaignsPage.en,
    "add-sponsor-page": AddSponsorPage.en,
    "add-campaign-page": AddCampaignPage.en,
    "edit-campaign-page": EditCampaignPage.en,
    "edit-sponsor-page": EditSponsorPage.en,
    "my-qa-page": MyQAPage.en,
    "dashboard-page": Dashboard.en,
    "providers-page": ProvidersPage.en,
    "organizations-page": OrganizationsPage.en,
    "organization-details-page": OrganizationDetailsPage.en,

    // Backdrops
    "upload-picture": UploadPicture.en,
    "delete-profile-picture": DeleteProfilePicture.en,
    "filter-security-check-reports": FilterSecurityCheckReports.en,
    "code-verification": CodeVerification.en,
    "question-details": QuestionDetails.en,
    "filter-questions": FilterQuestions.en,
    "change-password-backdrop": ChangePassword.en,

    // Routes
    root: Root.en,
  },

  kk: {
    // Blocks
    page: Page.kk,
    statistics: Statistics.kk,
    articles: Articles.kk,
    faq: FAQ.kk,
    "sos-center": SOSCenter.kk,
    login: Login.kk,
    welcome: Welcome.kk,
    "forgot-password": ForgotPassword.kk,
    "reset-password": ResetPassword.kk,
    "admin-profile": AdminProfile.kk,
    "edit-profile-details": EditProfileDetails.kk,
    providers: Providers.kk,
    "edit-provider": EditProvider.kk,
    "provider-overview": ProviderOverview.kk,
    "security-check": SecurityCheck.kk,
    "information-portal-suggestions": InformationPortalSuggestions.kk,
    "client-ratings": ClientRatings.kk,
    "contact-forms": ContactForms.kk,
    "provider-activities": ProviderActivities.kk,
    campaigns: Campaigns.kk,
    "add-sponsor": AddSponsor.kk,
    "sponsor-details": SponsorDetails.kk,
    "add-campaign": AddCampaign.kk,
    "campaign-details": CampaignDetails.kk,
    "my-qa-reports": MyQAReports.kk,
    "my-qa": MyQA.kk,
    Organizations: Organizations.kk,

    // Pages
    "not-found-page": NotFoundPage.kk,
    "articles-page": ArticlesPage.kk,
    "faq-page": FAQPage.kk,
    "sos-center-page": SOSCenterPage.kk,
    "login-page": LoginPage.kk,
    "forgot-password-page": ForgotPasswordPage.kk,
    "reset-password-page": ResetPasswordPage.kk,
    "admin-profile-page": AdminProfilePage.kk,
    "edit-profile-details-page": EditProfileDetailsPage.kk,
    "article-information-page": ArticleInformationPage.kk,
    "create-provider-page": CreateProviderPage.kk,
    "provider-overview-page": ProviderOverviewPage.kk,
    "reports-page": ReportsPage.kk,
    "campaigns-page": CampaignsPage.kk,
    "add-sponsor-page": AddSponsorPage.kk,
    "add-campaign-page": AddCampaignPage.kk,
    "edit-campaign-page": EditCampaignPage.kk,
    "edit-sponsor-page": EditSponsorPage.kk,
    "my-qa-page": MyQAPage.kk,
    "dashboard-page": Dashboard.kk,
    "providers-page": ProvidersPage.kk,
    "organizations-page": OrganizationsPage.kk,
    "organization-details-page": OrganizationDetailsPage.kk,

    // Backdrops
    "upload-picture": UploadPicture.kk,
    "delete-profile-picture": DeleteProfilePicture.kk,
    "filter-security-check-reports": FilterSecurityCheckReports.kk,
    "code-verification": CodeVerification.kk,
    "question-details": QuestionDetails.kk,
    "filter-questions": FilterQuestions.kk,
    "change-password-backdrop": ChangePassword.kk,

    // Routes
    root: Root.kk,
  },

  ru: {
    // Blocks
    page: Page.ru,
    statistics: Statistics.ru,
    articles: Articles.ru,
    faq: FAQ.ru,
    "sos-center": SOSCenter.ru,
    login: Login.ru,
    welcome: Welcome.ru,
    "forgot-password": ForgotPassword.ru,
    "reset-password": ResetPassword.ru,
    "admin-profile": AdminProfile.ru,
    "edit-profile-details": EditProfileDetails.ru,
    providers: Providers.ru,
    "edit-provider": EditProvider.ru,
    "provider-overview": ProviderOverview.ru,
    "security-check": SecurityCheck.ru,
    "information-portal-suggestions": InformationPortalSuggestions.ru,
    "client-ratings": ClientRatings.ru,
    "contact-forms": ContactForms.ru,
    "provider-activities": ProviderActivities.ru,
    campaigns: Campaigns.ru,
    "add-sponsor": AddSponsor.ru,
    "sponsor-details": SponsorDetails.ru,
    "add-campaign": AddCampaign.ru,
    "campaign-details": CampaignDetails.ru,
    "my-qa-reports": MyQAReports.ru,
    "my-qa": MyQA.ru,
    organizations: Organizations.ru,

    // Pages
    "not-found-page": NotFoundPage.ru,
    "articles-page": ArticlesPage.ru,
    "faq-page": FAQPage.ru,
    "sos-center-page": SOSCenterPage.ru,
    "login-page": LoginPage.ru,
    "forgot-password-page": ForgotPasswordPage.ru,
    "reset-password-page": ResetPasswordPage.ru,
    "admin-profile-page": AdminProfilePage.ru,
    "edit-profile-details-page": EditProfileDetailsPage.ru,
    "article-information-page": ArticleInformationPage.ru,
    "create-provider-page": CreateProviderPage.ru,
    "provider-overview-page": ProviderOverviewPage.ru,
    "reports-page": ReportsPage.ru,
    "campaigns-page": CampaignsPage.ru,
    "add-sponsor-page": AddSponsorPage.ru,
    "add-campaign-page": AddCampaignPage.ru,
    "edit-campaign-page": EditCampaignPage.ru,
    "edit-sponsor-page": EditSponsorPage.ru,
    "my-qa-page": MyQAPage.ru,
    "dashboard-page": Dashboard.ru,
    "providers-page": ProvidersPage.ru,
    "organizations-page": OrganizationsPage.ru,
    "organization-details-page": OrganizationDetailsPage.ru,

    // Backdrops
    "upload-picture": UploadPicture.ru,
    "delete-profile-picture": DeleteProfilePicture.ru,
    "filter-security-check-reports": FilterSecurityCheckReports.ru,
    "code-verification": CodeVerification.ru,
    "question-details": QuestionDetails.ru,
    "filter-questions": FilterQuestions.ru,
    "change-password-backdrop": ChangePassword.ru,

    // Routes
    root: Root.ru,
  },

  uk: {
    // Blocks
    page: Page.uk,
    statistics: Statistics.uk,
    articles: Articles.uk,
    faq: FAQ.uk,
    "sos-center": SOSCenter.uk,
    login: Login.uk,
    welcome: Welcome.uk,
    "forgot-password": ForgotPassword.uk,
    "reset-password": ResetPassword.uk,
    "admin-profile": AdminProfile.uk,
    "edit-profile-details": EditProfileDetails.uk,
    providers: Providers.uk,
    "edit-provider": EditProvider.uk,
    "provider-overview": ProviderOverview.uk,
    "security-check": SecurityCheck.uk,
    "information-portal-suggestions": InformationPortalSuggestions.uk,
    "client-ratings": ClientRatings.uk,
    "contact-forms": ContactForms.uk,
    "provider-activities": ProviderActivities.uk,
    campaigns: Campaigns.uk,
    "add-sponsor": AddSponsor.uk,
    "sponsor-details": SponsorDetails.uk,
    "add-campaign": AddCampaign.uk,
    "campaign-details": CampaignDetails.uk,
    "my-qa-reports": MyQAReports.uk,
    "my-qa": MyQA.uk,
    organizations: Organizations.uk,

    // Pages
    "not-found-page": NotFoundPage.uk,
    "articles-page": ArticlesPage.uk,
    "faq-page": FAQPage.uk,
    "sos-center-page": SOSCenterPage.uk,
    "login-page": LoginPage.uk,
    "forgot-password-page": ForgotPasswordPage.uk,
    "reset-password-page": ResetPasswordPage.uk,
    "admin-profile-page": AdminProfilePage.uk,
    "edit-profile-details-page": EditProfileDetailsPage.uk,
    "article-information-page": ArticleInformationPage.uk,
    "create-provider-page": CreateProviderPage.uk,
    "provider-overview-page": ProviderOverviewPage.uk,
    "reports-page": ReportsPage.uk,
    "campaigns-page": CampaignsPage.uk,
    "add-sponsor-page": AddSponsorPage.uk,
    "add-campaign-page": AddCampaignPage.uk,
    "edit-campaign-page": EditCampaignPage.uk,
    "edit-sponsor-page": EditSponsorPage.uk,
    "my-qa-page": MyQAPage.uk,
    "dashboard-page": Dashboard.uk,
    "providers-page": ProvidersPage.uk,
    "organizations-page": Organizations.uk,
    "organization-details-page": OrganizationDetailsPage.uk,

    // Backdrops
    "upload-picture": UploadPicture.uk,
    "delete-profile-picture": DeleteProfilePicture.uk,
    "filter-security-check-reports": FilterSecurityCheckReports.uk,
    "code-verification": CodeVerification.uk,
    "question-details": QuestionDetails.uk,
    "filter-questions": FilterQuestions.uk,
    "change-password-backdrop": ChangePassword.uk,

    // Routes
    root: Root.uk,
  },

  pl: {
    // Blocks
    page: Page.pl,
    statistics: Statistics.pl,
    articles: Articles.pl,
    faq: FAQ.pl,
    "sos-center": SOSCenter.pl,
    login: Login.pl,
    welcome: Welcome.pl,
    "forgot-password": ForgotPassword.pl,
    "reset-password": ResetPassword.pl,
    "admin-profile": AdminProfile.pl,
    "edit-profile-details": EditProfileDetails.pl,
    providers: Providers.pl,
    "edit-provider": EditProvider.pl,
    "provider-overview": ProviderOverview.pl,
    "security-check": SecurityCheck.pl,
    "information-portal-suggestions": InformationPortalSuggestions.pl,
    "client-ratings": ClientRatings.pl,
    "contact-forms": ContactForms.pl,
    "provider-activities": ProviderActivities.pl,
    campaigns: Campaigns.pl,
    "add-sponsor": AddSponsor.pl,
    "sponsor-details": SponsorDetails.pl,
    "add-campaign": AddCampaign.pl,
    "campaign-details": CampaignDetails.pl,
    "my-qa-reports": MyQAReports.pl,
    "my-qa": MyQA.pl,
    organizations: Organizations.pl,

    // Pages
    "not-found-page": NotFoundPage.pl,
    "articles-page": ArticlesPage.pl,
    "faq-page": FAQPage.pl,
    "sos-center-page": SOSCenterPage.pl,
    "login-page": LoginPage.pl,
    "forgot-password-page": ForgotPasswordPage.pl,
    "reset-password-page": ResetPasswordPage.pl,
    "admin-profile-page": AdminProfilePage.pl,
    "edit-profile-details-page": EditProfileDetailsPage.pl,
    "article-information-page": ArticleInformationPage.pl,
    "create-provider-page": CreateProviderPage.pl,
    "provider-overview-page": ProviderOverviewPage.pl,
    "reports-page": ReportsPage.pl,
    "campaigns-page": CampaignsPage.pl,
    "add-sponsor-page": AddSponsorPage.pl,
    "add-campaign-page": AddCampaignPage.pl,
    "edit-campaign-page": EditCampaignPage.pl,
    "edit-sponsor-page": EditSponsorPage.pl,
    "my-qa-page": MyQAPage.pl,
    "dashboard-page": Dashboard.pl,
    "providers-page": ProvidersPage.pl,
    "organizations-page": OrganizationsPage.pl,
    "organization-details-page": OrganizationDetailsPage.pl,

    // Backdrops
    "upload-picture": UploadPicture.pl,
    "delete-profile-picture": DeleteProfilePicture.pl,
    "filter-security-check-reports": FilterSecurityCheckReports.pl,
    "code-verification": CodeVerification.pl,
    "question-details": QuestionDetails.pl,
    "filter-questions": FilterQuestions.pl,
    "change-password-backdrop": ChangePassword.pl,

    // Routes
    root: Root.pl,
  },
};

i18n.use(initReactI18next).init({
  resources,
  fallbackLng: "en",
  lng: localStorage.getItem("language") || "en",
});

export default i18n;
