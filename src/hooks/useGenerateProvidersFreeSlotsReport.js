import { useMutation } from "@tanstack/react-query";
import { adminSvc } from "@USupport-components-library/services";
import { useError } from "./useError";

export default function useGenerateProvidersFreeSlotsReport(
  onSuccess,
  onError
) {
  const generateReport = async (date) => {
    const response = await adminSvc.generateProviderFreeSlotsReport(date);
    return response;
  };

  return useMutation({
    mutationFn: generateReport,
    mutationKey: ["generate-providers-free-slots-report"],
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      onError?.(errorMessage);
    },
  });
}

export { useGenerateProvidersFreeSlotsReport };
