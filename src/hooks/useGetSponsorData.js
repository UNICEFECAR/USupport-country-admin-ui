import { useQuery } from "@tanstack/react-query";

import { adminSvc } from "@USupport-components-library/services";

import { transformCampaignData } from "#utils";

export const useGetSponsorData = (sponsorId) => {
  const getSponsorData = async () => {
    const { data } = await adminSvc.getSponsorDataById(sponsorId);
    return {
      sponsorId: data.sponsor_id,
      sponsorName: data.name,
      email: data.email,
      phone: data.phone,
      image: data.image,
      campaigns: data.campaigns_data.length,
      activeCampaigns: data.campaigns_data?.filter((x) => x.active).length,
      campaignsData: data.campaigns_data?.map((campaign) => {
        return transformCampaignData(campaign);
      }),
    };
  };

  const getSponsorDataQuery = useQuery(
    ["sponsor-data", sponsorId],
    getSponsorData,
    {
      enabled: !!sponsorId,
    }
  );

  return getSponsorDataQuery;
};
