import { useQuery } from "@tanstack/react-query";
import { adminSvc } from "@USupport-components-library/services";

export const useGetClientRatings = (userType = "client") => {
  const getClientRatings = async () => {
    const countryId = localStorage.getItem("country_id");
    let data;
    if (userType === "client") {
      const response = await adminSvc.getClientRatings(countryId);
      data = response.data;
    } else {
      const response = await adminSvc.getProviderRatings(countryId);
      data = response.data;
    }
    return data.map((item) => {
      return {
        rating: item.rating,
        comment: item.comment,
        createdAt: new Date(item.created_at),
      };
    });
  };

  return useQuery(["client-ratings", userType], getClientRatings);
};
