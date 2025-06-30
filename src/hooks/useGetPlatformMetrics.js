import { useQuery } from "@tanstack/react-query";
import { adminSvc } from "@USupport-components-library/services";

export default function useGetPlatformMetrics(enabled = true) {
  const fetchPlatformMetrics = async () => {
    const { data } = await adminSvc.getPlatformMetrics();
    console.log("Platform Metrics in useGetPlafromMetrics hook:", data);
    return data;
  };

  const query = useQuery(["platform-metrics"], fetchPlatformMetrics, {
    enabled: enabled,
  });

  return query;
}

export { useGetPlatformMetrics };
