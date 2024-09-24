import { useMutation } from "@tanstack/react-query";
import { organizationSvc } from "@USupport-components-library/services";
import { useError } from "./useError";

export const useCreateOrganization = (onSuccess, onError) => {
  return useMutation({
    mutationFn: async (data) => {
      return await organizationSvc.createOrganization(data);
    },
    onSuccess,
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      onError(errorMessage);
    },
  });
};
export default useCreateOrganization;
