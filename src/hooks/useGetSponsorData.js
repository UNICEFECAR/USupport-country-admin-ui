import { useQuery } from "@tanstack/react-query";

export const useGetSponsorData = (sponsorId) => {
  const getSponsorData = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return true;
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
