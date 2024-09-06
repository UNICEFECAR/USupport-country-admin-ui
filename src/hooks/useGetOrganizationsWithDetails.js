import { useQuery } from "@tanstack/react-query";
import { organizationSvc } from "@USupport-components-library/services";

export const useGetOrganizationsWithDetails = () => {
  return useQuery({
    queryKey: ["GetOrganizationsWithDetails"],
    queryFn: () => {
      return organizationSvc.getOrganizationsWithDetails();
    },
  });
};
export default useGetOrganizationsWithDetails;
