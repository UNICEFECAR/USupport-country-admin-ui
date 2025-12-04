import { useQuery } from "@tanstack/react-query";
import { adminSvc } from "@USupport-components-library/services";

export default function useGetStatistics(countryId) {
  const fetchData = async () => {
    if (!countryId)
      return [
        { type: "clients", value: 0 },
        { type: "providers", value: 0 },
        { type: "articles", value: 0 },
        { type: "consultations", value: 0 },
      ];
    let response;
    response = await adminSvc.getCountryStatistics(countryId);

    const data = response.data;
    const formattedData = [
      { type: "clients", value: data.clientsNo },
      { type: "providers", value: data.providersNo },
      { type: "articles", value: data.publishedArticlesNo },
      { type: "consultations", value: data.scheduledConsultationsNo },
      { type: "organizations", value: data.organizationsNo },
    ];
    return formattedData;
  };
  const statisticsQuery = useQuery(["statistics", countryId], fetchData, {
    enabled: !!countryId,
  });

  return statisticsQuery;
}

export { useGetStatistics };
