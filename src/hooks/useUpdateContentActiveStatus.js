import { useMutation } from "@tanstack/react-query";
import { adminSvc } from "@USupport-components-library/services";
import { useError } from "#hooks";

export default function useUpdateContentActiveStatus(
  onSuccess,
  onError,
  onMutate
) {
  const updateContentActiveStatus = async ({ contentType, status }) => {
    const { data } = await adminSvc.updateContentActiveStatus({
      contentType,
      status,
    });
    return data;
  };

  const updateContentActiveStatusMutation = useMutation(
    updateContentActiveStatus,
    {
      onMutate,
      onSuccess,
      onError: (error, variables, context) => {
        const { message: errorMessage } = useError(error);
        onError(errorMessage, variables, context);
      },
    }
  );

  return updateContentActiveStatusMutation;
}

export { useUpdateContentActiveStatus };
