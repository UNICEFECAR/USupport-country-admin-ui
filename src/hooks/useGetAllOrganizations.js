import { useQuery } from "@tanstack/react-query";
import { organizationSvc } from "@USupport-components-library/services";

export default function useGetAllOrganizations() {
  return useQuery(["organizations"], async () => {
    const data = await organizationSvc.getAllOrganizations();
    return data;
  });
}
export { useGetAllOrganizations };
