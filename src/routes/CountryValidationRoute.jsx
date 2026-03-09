import React, { useState } from "react";
import { Navigate, useSearchParams, useLocation } from "react-router-dom";
import { useEventListener } from "#hooks";

export const CountryValidationRoute = ({ children }) => {
  const [country, setCountry] = useState(localStorage.getItem("country"));
  const language = localStorage.getItem("language") || "en";
  const location = useLocation();
  const [searchParams] = useSearchParams();

  useEventListener("countryChanged", () => {
    const country = localStorage.getItem("country");
    if (country) {
      setCountry(country);
    }
  });

  if (!country || country === "global") {
    const next =
      searchParams.get("next") ||
      new URLSearchParams(location.search).get("next");
    const to =
      next && next.startsWith("/country-admin/")
        ? `/country-admin/${language}/?next=${encodeURIComponent(next)}`
        : `/country-admin/${language}/`;
    return <Navigate to={to} replace />;
  }

  return children;
};
