import { useQuery } from "@tanstack/react-query";
import { adminSvc } from "@USupport-components-library/services";

export default function useGetPlatformMetrics({
  enabled,
  startDate,
  endDate,
  sex,
  urbanRural,
  yearOfBirthFrom,
  yearOfBirthTo,
}) {
  const fetchPlatformMetrics = async () => {
    const { data } = await adminSvc.getPlatformMetrics({
      startDate,
      endDate,
      sex,
      urbanRural,
      yearOfBirthFrom,
      yearOfBirthTo,
    });
    return data;
  };

  const query = useQuery(
    [
      "platform-metrics",
      startDate,
      endDate,
      sex,
      urbanRural,
      yearOfBirthFrom,
      yearOfBirthTo,
    ],
    fetchPlatformMetrics,
    {
      enabled: enabled,
    }
  );

  return query;
}

export { useGetPlatformMetrics };
