import React from "react";
import jwtDecode from "jwt-decode";
import { Navigate } from "react-router-dom";
import { useIsLoggedIn } from "#hooks";

export const ProtectedRoute = ({ children }) => {
  const isLoggedIn = useIsLoggedIn();
  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;
  const isAdmin = decoded?.adminRole === "country";

  if (!isLoggedIn || !isAdmin)
    return (
      <Navigate to={`${localStorage.getItem("language")}/country-admin/`} />
    );

  return children;
};
