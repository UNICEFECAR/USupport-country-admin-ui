import { useMutation } from "@tanstack/react-query";
import { organizationSvc } from "@USupport-components-library/services";
import { useError } from "./useError";

export const useEditOrganization = (onSuccess, onError) => {
  return useMutation({
    mutationFn: async (data) => {
      return await organizationSvc.editOrganization(data);
    },
    onSuccess,
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      onError(errorMessage);
    },
  });
};
export default useEditOrganization;
