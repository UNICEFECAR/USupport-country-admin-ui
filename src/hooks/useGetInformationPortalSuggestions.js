import { useQuery } from "@tanstack/react-query";
import { adminSvc } from "@USupport-components-library/services";

export const useGetInformationPortalSuggestions = () => {
  const countryId = localStorage.getItem("country_id");

  const getInformationPortalSuggestions = async () => {
    const { data } = await adminSvc.getInformationPortalSuggestions(countryId);
    return data.map((item) => {
      return {
        suggestion: item.suggestion,
        createdAt: new Date(item.created_at),
        clientEmail: item.email,
        clientName: item.name ? `${item.name} ${item.surname}` : null,
        clientNickname: item.nickname,
      };
    });
  };

  return useQuery(
    ["information-portal-suggestions", countryId],
    getInformationPortalSuggestions
  );
};
