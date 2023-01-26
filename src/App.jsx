import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
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
} from "#pages";

import { CountryValidationRoute, ProtectedRoute } from "#routes";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./App.scss";

// Create a react-query client
const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});

// AOS imports
import "aos/dist/aos.css";
import AOS from "aos";

function App() {
  AOS.init({
    offset: 10,
    duration: 1000,
    easing: "ease-in-sine",
    delay: 300,
    anchorPlacement: "top-bottom",
    once: false,
  });

  return (
    <QueryClientProvider client={queryClient}>
      <Router basename="/country-admin">
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
          <Route path="/" element={<Welcome />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <ReactQueryDevtools initialOpen />
      <ToastContainer />
    </QueryClientProvider>
  );
}

export default App;
