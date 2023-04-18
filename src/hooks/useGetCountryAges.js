import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function useGetCountryAges() {
  const queryClient = useQueryClient();

  const countriesData = queryClient.getQueryData(["countries"]);
  const country = localStorage.getItem("country");
  const selectedCountry = countriesData?.find((c) => c.value === country);
  const minAge = selectedCountry?.minAge;
  const maxAge = selectedCountry?.maxAge;

  const getYearsOptions = useCallback(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (
      let year = currentYear - maxAge;
      year <= currentYear - minAge;
      year++
    ) {
      years.push({ label: year.toString(), value: year });
    }
    return years.reverse();
  }, [countriesData]);

  return getYearsOptions();
}

export { useGetCountryAges };
