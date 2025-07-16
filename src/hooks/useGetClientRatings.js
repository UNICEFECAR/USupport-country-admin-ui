import { useQuery } from "@tanstack/react-query";
import { adminSvc } from "@USupport-components-library/services";

export const useGetClientRatings = (userType = "client") => {
  const getClientRatings = async () => {
    const countryId = localStorage.getItem("country_id");
    let data;

    if (userType === "all") {
      const clientResponse = await adminSvc.getClientRatings(countryId);
      const providerResponse = await adminSvc.getProviderRatings(countryId);
      data = [
        ...clientResponse.data.map((x) => ({
          ...x,
          userType: "client",
        })),
        ...providerResponse.data.map((x) => ({
          ...x,
          userType: "provider",
        })),
      ].sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at);
      });
    } else if (userType === "client") {
      const response = await adminSvc.getClientRatings(countryId);
      data = response.data.map((x) => ({
        ...x,
        userType: "client",
      }));
    } else {
      const response = await adminSvc.getProviderRatings(countryId);
      data = response.data.map((x) => ({
        ...x,
        userType: "provider",
      }));
    }
    console.log(data);
    return data.map((item) => {
      return {
        rating: item.rating,
        comment: item.comment,
        createdAt: new Date(item.created_at),
        userType: item.userType,
      };
    });
  };

  return useQuery(["client-ratings", userType], getClientRatings);
};
