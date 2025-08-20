import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminSvc } from "@USupport-components-library/services";
import { useError } from "./useError";

/**
 * Hook to update a baseline assessment threshold by ID
 */
export default function useUpdateBaselineAssessmentThreshold(
  onSuccess,
  onError
) {
  const queryClient = useQueryClient();

  const updateThreshold = async ({ id, ...payload }) => {
    const { data } = await adminSvc.updateBaselineAssessmentThreshold(
      id,
      payload
    );
    return data;
  };

  const updateThresholdMutation = useMutation(updateThreshold, {
    onSuccess: (data) => {
      onSuccess?.(data);
      // Invalidate and refetch the thresholds list
      queryClient.invalidateQueries({
        queryKey: ["baseline-assessment-thresholds"],
      });
    },
    onError: (error) => {
      console.log(error);
      const { message: errorMessage } = useError(error);
      console.log(errorMessage);
      onError?.(errorMessage);
    },
  });

  return updateThresholdMutation;
}

export { useUpdateBaselineAssessmentThreshold };
