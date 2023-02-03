import { useQuery } from "@tanstack/react-query";
import { adminSvc } from "@USupport-components-library/services";

export const useGetClientRatings = () => {
  const getClientRatings = async () => {
    const countryId = localStorage.getItem("country_id");
    const { data } = await adminSvc.getClientRatings(countryId);
    return data.map((item) => {
      return {
        rating: item.rating,
        comment: item.comment,
        createdAt: new Date(item.created_at),
        clientEmail: item.email,
        clientName: item.name ? `${item.name} ${item.surname}` : null,
        clientNickname: item.nickname,
      };
    });
  };

  return useQuery(["client-ratings"], getClientRatings);
};
