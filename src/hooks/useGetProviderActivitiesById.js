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
        clientJoined: activity.client_joined,
        providerJoined: activity.provider_joined,
        time: new Date(activity.time),
        // This mapper is a whitelist, so the table and the CSV export both fall
        // back to an hour until the duration is named here.
        durationMinutes: activity.duration_minutes,
        type: activity.type,
        campaignName: activity.campaign_name,
        createdAt: activity.created_at,
        organizationName: activity.organization_name,
      };
    });
  };
  return useQuery(["providerActivities", providerId], getProviderActivities, {
    enabled: !!providerId,
  });
};
