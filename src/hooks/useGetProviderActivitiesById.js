import { useQuery } from "@tanstack/react-query";
import { adminSvc } from "@USupport-components-library/services";

export const useGetProviderActivitiesById = (providerId) => {
  const getProviderActivities = async () => {
    const { data } = await adminSvc.getProviderActivitiesById(providerId);

    return data.map((activity) => {
      return {
        displayName: activity.clientName,
        price: activity.price,
        status: activity.status,
        time: new Date(activity.time),
        type: activity.type,
        campaignName: activity.campaign_name,
      };
    });
  };
  return useQuery(["providerActivities", providerId], getProviderActivities, {
    enabled: !!providerId,
  });
};
