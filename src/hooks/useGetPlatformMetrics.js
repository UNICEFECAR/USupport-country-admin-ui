import { useQuery } from "@tanstack/react-query";
import { adminSvc } from "@USupport-components-library/services";

export default function useGetPlatformMetrics({ enabled, startDate, endDate }) {
  const fetchPlatformMetrics = async () => {
    const { data } = await adminSvc.getPlatformMetrics({
      startDate,
      endDate,
    });
    return data;
  };

  const query = useQuery(
    ["platform-metrics", startDate, endDate],
    fetchPlatformMetrics,
    {
      enabled: enabled,
    }
  );

  return query;
}

export { useGetPlatformMetrics };
