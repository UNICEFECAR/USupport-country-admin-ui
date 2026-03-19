import { useQuery } from "@tanstack/react-query";
import { countrySvc } from "@USupport-components-library/services";

const fetchActiveCountriesArticles = async () => {
  const response = await countrySvc.getActiveCountriesArticles();
  return response.data;
};

export const useGetActiveCountriesArticles = () => {
  return useQuery(["active-countries-articles"], fetchActiveCountriesArticles);
};
