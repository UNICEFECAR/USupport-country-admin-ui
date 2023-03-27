import { useMutation } from "@tanstack/react-query";
import { adminSvc } from "@USupport-components-library/services";
import { useError } from "#hooks";

export default function useUpdateProviderStatus(onSuccess, onError) {
  const updateProviderStatus = async ({ providerId, status }) => {
    const { data } = await adminSvc.updateProviderStatus({
      providerDetailId: providerId,
      status,
    });
    return data;
  };

  const updateProviderStatusMutation = useMutation(updateProviderStatus, {
    onSuccess,
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      onError(errorMessage);
    },
  });

  return updateProviderStatusMutation;
}

export { useUpdateProviderStatus };
