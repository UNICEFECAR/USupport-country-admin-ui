import { useQuery } from "@tanstack/react-query";
import { organizationSvc } from "@USupport-components-library/services";

export const useGetOrganizationsWithDetails = () => {
  return useQuery({
    queryKey: ["GetOrganizationsWithDetails"],
    queryFn: async () => {
      const data = await organizationSvc.getOrganizationsWithDetails();
      return data.map((x) => ({
        ...x,
        organizationId: x.organization_id,
      }));
    },
  });
};
export default useGetOrganizationsWithDetails;
