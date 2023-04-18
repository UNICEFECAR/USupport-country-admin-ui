import { useQuery } from "@tanstack/react-query";
import { adminSvc } from "@USupport-components-library/services";

import { transformCampaignData } from "#utils";

export const useGetCampaignDataById = (campaignId) => {
  const getCampaignDataById = async () => {
    const { data } = await adminSvc.getCampaignDataById(campaignId);
    const transformed = transformCampaignData(data);
    return transformed;
  };

  const query = useQuery(["campaign-data", campaignId], getCampaignDataById, {
    enabled: !!campaignId,
  });

  return query;
};
