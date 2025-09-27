import { useQuery } from "@tanstack/react-query";
import { adminSvc } from "@USupport-components-library/services";

const fetchMoodTrackerReport = async ({ startDate, endDate }) => {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const response = await adminSvc.getMoodTrackerReport(params.toString());
  return response.data;
};

export const useGetMoodTrackerReport = ({ startDate, endDate }) => {
  return useQuery(
    ["mood-tracker-report", startDate, endDate],
    () => fetchMoodTrackerReport({ startDate, endDate }),
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );
};

export default useGetMoodTrackerReport;
