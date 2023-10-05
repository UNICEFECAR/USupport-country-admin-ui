import { useQuery } from "@tanstack/react-query";
import { adminSvc } from "@USupport-components-library/services";

export const useGetAllSponsorsData = () => {
  const getAllSponsorsData = async () => {
    const { data } = await adminSvc.getAllSponsorsData();
    return data.map((sponsor) => {
      return {
        sponsorId: sponsor.sponsor_id,
        sponsorName: sponsor.name,
        email: sponsor.email,
        phone: sponsor.phone,
        image: sponsor.image,
        activeCampaigns: sponsor.active_campaigns,
        totalCampaigns: sponsor.total_campaigns,
      };
    });
  };

  const getAllSponsorsDataQuery = useQuery(
    ["sponsor-data"],
    getAllSponsorsData
  );

  return getAllSponsorsDataQuery;
};
