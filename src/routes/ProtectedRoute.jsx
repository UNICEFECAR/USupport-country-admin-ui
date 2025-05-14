import React from "react";
import jwtDecode from "jwt-decode";
import { Navigate } from "react-router-dom";
import { useIsLoggedIn } from "#hooks";

export const ProtectedRoute = ({ children }) => {
  const isLoggedIn = useIsLoggedIn();
  const token = localStorage.getItem("token");
  let decoded = null;
  try {
    decoded = token ? jwtDecode(token) : null;
  } catch (error) {
    console.log(error);
  }
  const isAdmin = decoded?.adminRole === "country";

  if (!isLoggedIn || !isAdmin)
    return (
      <Navigate to={`/country-admin/${localStorage.getItem("language")}/`} />
    );

  return children;
};
