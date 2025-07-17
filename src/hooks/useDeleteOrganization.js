import { useMutation } from "@tanstack/react-query";
import { organizationSvc } from "@USupport-components-library/services";
import { useError } from "./useError";

export default function useDeleteOrganization(onSuccess, onError) {
  const deleteOrganization = async (organizationId) => {
    const { data } = await organizationSvc.deleteOrganization(organizationId);
    return data;
  };

  const deleteOrganizationMutation = useMutation(deleteOrganization, {
    onSuccess: () => onSuccess(),
    onError: (err) => {
      const { providers } = err?.response?.data?.error?.customData;

      const { message: error } = useError(err);
      onError(
        error,
        providers.map((provider) => ({
          providerDetailId: provider.provider_detail_id,
          name: provider.name,
          surname: provider.surname,
        }))
      );
    },
  });

  return deleteOrganizationMutation;
}

export { useDeleteOrganization };
