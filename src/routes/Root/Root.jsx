import React, { useState, useCallback } from "react";
import {
  // BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useParams,
} from "react-router-dom";
import { useTranslation } from "react-i18next";

import { IdleTimer } from "@USupport-components-library/src";

import { useEventListener } from "#hooks";

import {
  AdminProfile,
  ArticleInformation,
  Articles,
  CreateProvider,
  Dashboard,
  EditProfileDetails,
  EditProvider,
  FAQ,
  ForgotPassword,
  Login,
  NotFound,
  ProviderOverview,
  Providers,
  ResetPassword,
  SOSCenter,
  Welcome,
  Reports,
  ProviderActivities,
  Campaigns,
  AddSponsor,
  EditSponsor,
  SponsorDetails,
  AddCampaign,
  EditCampaign,
  CampaignDetails,
  MyQA,
  Organizations,
  OrganizationDetails,
} from "#pages";

import { CountryValidationRoute, ProtectedRoute } from "../../routes";

const RootContext = React.createContext();

const LanguageLayout = () => {
  const { language } = useParams();

  const allLangs = ["en", "ru", "kk", "pl", "uk"];

  if (!allLangs.includes(language) || !language) {
    return <Navigate to="/en/country-admin" />;
  }
  return (
    <Routes>
      <Route
        path="/country-admin/login"
        element={
          <CountryValidationRoute>
            <Login />
          </CountryValidationRoute>
        }
      />
      <Route
        path="/country-admin/forgot-password"
        element={
          <CountryValidationRoute>
            <ForgotPassword />
          </CountryValidationRoute>
        }
      />
      <Route
        path="/country-admin/reset-password"
        element={
          <CountryValidationRoute>
            <ResetPassword />
          </CountryValidationRoute>
        }
      />
      <Route
        path="/country-admin/providers"
        element={
          <ProtectedRoute>
            <Providers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/country-admin/provider/details"
        element={
          <ProtectedRoute>
            <ProviderOverview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/country-admin/create-provider"
        element={
          <ProtectedRoute>
            <CreateProvider />
          </ProtectedRoute>
        }
      />
      <Route
        path="/country-admin/edit-provider"
        element={
          <ProtectedRoute>
            <EditProvider />
          </ProtectedRoute>
        }
      />
      <Route
        path="/country-admin/profile"
        element={
          <ProtectedRoute>
            <AdminProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/country-admin/profile/details/edit"
        element={
          <ProtectedRoute>
            <EditProfileDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/country-admin/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/country-admin/articles"
        element={
          <ProtectedRoute>
            <Articles />
          </ProtectedRoute>
        }
      />
      <Route
        path="/country-admin/article/:id"
        element={
          <ProtectedRoute>
            <ArticleInformation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/country-admin/faq"
        element={
          <ProtectedRoute>
            <FAQ />
          </ProtectedRoute>
        }
      />
      <Route
        path="/country-admin/sos-center"
        element={
          <ProtectedRoute>
            <SOSCenter />
          </ProtectedRoute>
        }
      />
      <Route
        path="/country-admin/reports"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/country-admin/provider-activities"
        element={
          <ProtectedRoute>
            <ProviderActivities />
          </ProtectedRoute>
        }
      />
      <Route
        path="/country-admin/campaigns"
        element={
          <ProtectedRoute>
            <Campaigns />
          </ProtectedRoute>
        }
      />
      <Route
        path="/country-admin/add-sponsor"
        element={
          <ProtectedRoute>
            <AddSponsor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/country-admin/edit-sponsor"
        element={
          <ProtectedRoute>
            <EditSponsor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/country-admin/sponsor-details"
        element={
          <ProtectedRoute>
            <SponsorDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/country-admin/add-campaign"
        element={
          <ProtectedRoute>
            <AddCampaign />
          </ProtectedRoute>
        }
      />
      <Route
        path="/country-admin/edit-campaign"
        element={
          <ProtectedRoute>
            <EditCampaign />
          </ProtectedRoute>
        }
      />
      <Route
        path="/country-admin/campaign-details"
        element={
          <ProtectedRoute>
            <CampaignDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/country-admin/my-qa"
        element={
          <ProtectedRoute>
            <MyQA />
          </ProtectedRoute>
        }
      />
      <Route
        path="/country-admin/organizations"
        element={
          <ProtectedRoute>
            <Organizations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/country-admin/organization-details"
        element={
          <ProtectedRoute>
            <OrganizationDetails />
          </ProtectedRoute>
        }
      />
      <Route path="/country-admin" element={<Welcome />} />
      <Route path="/country-admin/*" element={<NotFound />} />
    </Routes>
  );
};

export default function Root() {
  const { t } = useTranslation("root");

  const token = localStorage.getItem("token");
  const language = localStorage.getItem("language");
  const [loggedIn, setLoggedIn] = useState(!!token);

  const logoutHandler = useCallback(() => {
    setLoggedIn(false);
  }, []);

  useEventListener("logout", logoutHandler);

  const loginHandler = useCallback(() => {
    setLoggedIn(true);
  }, []);

  useEventListener("login", loginHandler);

  return (
    <React.Fragment>
      {loggedIn && (
        <IdleTimer
          setLoggedIn={setLoggedIn}
          t={t}
          NavigateComponent={Navigate}
          isInAdmin={true}
        />
      )}
      <Routes>
        <Route
          path="/:language"
          element={<Navigate to={`/${language}/country-admin`} replace />}
        />
        <Route path=":language/*" element={<LanguageLayout />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </React.Fragment>
  );
}

export { Root, RootContext };
