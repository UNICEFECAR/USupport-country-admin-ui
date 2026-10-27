import React from "react";
import { Navigate, useParams } from "react-router-dom";

export const ConsultationProblemReports = () => {
  const { language } = useParams();
  return (
    <Navigate
      to={`/country-admin/${language}/reports?tab=consultation_problems`}
      replace
    />
  );
};
