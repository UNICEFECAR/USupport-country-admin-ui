import { useQuery } from "@tanstack/react-query";
import { adminSvc } from "@USupport-components-library/services";

/**
 * Hook to get all baseline assessment thresholds for the current country
 */
export default function useGetBaselineAssessmentThresholds() {
  const fetchThresholds = async () => {
    const { data } = await adminSvc.getAllBaselineAssessmentThresholds();

    return data.map((x) => ({
      ...x,
      baselineAssesmentThresholdId: x.baseline_assessment_threshold_id,
    }));
  };

  const thresholdsQuery = useQuery(
    ["baseline-assessment-thresholds"],
    fetchThresholds
  );

  return thresholdsQuery;
}

export { useGetBaselineAssessmentThresholds };
