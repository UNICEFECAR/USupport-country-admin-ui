import { useQuery } from "@tanstack/react-query";
import { adminSvc } from "@USupport-components-library/services";

export const useGetSOSCenterClicks = () => {
  const getSOSCenterClicks = async () => {
    const response = await adminSvc.getSOSCenterClicks();
    const data = response.data;

    // Format the data for easier consumption by components
    const formattedData = {
      totalClicks: data.totalClicks || 0,
      totalUniqueCenters: data.totalUniqueCenters || 0,
      clicksByCenter:
        data.clicksByCenter?.map((center) => ({
          sosCenterId: center.sosCenterId,
          isMain: center.isMain,
          clickCount: center.clickCount,
          uniqueUsers: center.uniqueUsers,
          timestamps: center.timestamps,
          platformBreakdown: center.platformBreakdown,
          firstClickAt: center.firstClickAt
            ? new Date(center.firstClickAt)
            : null,
          lastClickAt: center.lastClickAt ? new Date(center.lastClickAt) : null,
        })) || [],
    };

    return formattedData;
  };

  return useQuery(["sos-center-clicks"], getSOSCenterClicks, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export default useGetSOSCenterClicks;
