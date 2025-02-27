import { useMutation } from "@tanstack/react-query";
import { organizationSvc } from "@USupport-components-library/services";
import { useError } from "./useError";

export const useAssignProvidersToOrganization = (onSuccess, onError) => {
  return useMutation({
    mutationFn: async (data) => {
      console.log("here");
      return await organizationSvc.assignProvidersToOrganization(data);
    },
    onSuccess,
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      onError(errorMessage);
    },
  });
};
export default useAssignProvidersToOrganization;
