import { apiGet } from "./apiHandlers";

// Example file with requests to the Admin API
// Make one file for each service that this app is accessing

const ADMIN_API_ROUTE = "/admin";

export const getAdmin = async () => {
  const admin = await apiGet({ path: `${ADMIN_API_ROUTE}/` });

  return admin;
};
