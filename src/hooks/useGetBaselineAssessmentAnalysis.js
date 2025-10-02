import { useQuery } from "@tanstack/react-query";
import { adminSvc } from "@USupport-components-library/services";

/**
 * Hook to get baseline assessment analysis data with median calculations
 */
export default function useGetBaselineAssessmentAnalysis({
  startDate,
  endDate,
}) {
  const fetchAnalysis = async () => {
    const { data } = await adminSvc.getBaselineAssessmentAnalysis({
      startDate,
      endDate,
    });
    return data;
  };

  const analysisQuery = useQuery(
    ["baseline-assessment-analysis", startDate, endDate],
    fetchAnalysis,
    {
      // Refetch every 5 minutes since this is aggregated data that changes over time
      refetchInterval: 5 * 60 * 1000,
      // Keep data fresh for 1 minute
      staleTime: 1 * 60 * 1000,
    }
  );

  return analysisQuery;
}

export { useGetBaselineAssessmentAnalysis };
