import React, { useState, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
} from "#pages";

import { CountryValidationRoute, ProtectedRoute } from "../../routes";

const RootContext = React.createContext();

export default function Root() {
  const { t } = useTranslation("root");

  const token = localStorage.getItem("token");
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
    <Router basename="/country-admin">
      {loggedIn && <IdleTimer setLoggedIn={setLoggedIn} t={t} />}
      <Routes>
        <Route
          path="/login"
          element={
            <CountryValidationRoute>
              <Login />
            </CountryValidationRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <CountryValidationRoute>
              <ForgotPassword />
            </CountryValidationRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <CountryValidationRoute>
              <ResetPassword />
            </CountryValidationRoute>
          }
        />
        <Route
          path="/providers"
          element={
            <ProtectedRoute>
              <Providers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/provider/details"
          element={
            <ProtectedRoute>
              <ProviderOverview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-provider"
          element={
            <ProtectedRoute>
              <CreateProvider />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-provider"
          element={
            <ProtectedRoute>
              <EditProvider />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AdminProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/details/edit"
          element={
            <ProtectedRoute>
              <EditProfileDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/articles"
          element={
            <ProtectedRoute>
              <Articles />
            </ProtectedRoute>
          }
        />
        <Route
          path="/article/:id"
          element={
            <ProtectedRoute>
              <ArticleInformation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faq"
          element={
            <ProtectedRoute>
              <FAQ />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sos-center"
          element={
            <ProtectedRoute>
              <SOSCenter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/provider-activities"
          element={
            <ProtectedRoute>
              <ProviderActivities />
            </ProtectedRoute>
          }
        />
        <Route
          path="/campaigns"
          element={
            <ProtectedRoute>
              <Campaigns />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-sponsor"
          element={
            <ProtectedRoute>
              <AddSponsor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-sponsor"
          element={
            <ProtectedRoute>
              <EditSponsor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sponsor-details"
          element={
            <ProtectedRoute>
              <SponsorDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-campaign"
          element={
            <ProtectedRoute>
              <AddCampaign />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-campaign"
          element={
            <ProtectedRoute>
              <EditCampaign />
            </ProtectedRoute>
          }
        />
        <Route
          path="/campaign-details"
          element={
            <ProtectedRoute>
              <CampaignDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-qa"
          element={
            <ProtectedRoute>
              <MyQA />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Welcome />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export { Root, RootContext };
