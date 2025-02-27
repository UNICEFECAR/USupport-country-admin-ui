import { useQuery } from "@tanstack/react-query";
import { adminSvc } from "@USupport-components-library/services";

export const useGetAllProviderNames = () => {
  return useQuery({
    queryKey: ["GetAllProviderNames"],
    queryFn: async () => {
      const response = await adminSvc.getAllProviderNames();
      const data = response.data;
      return data.map((x) => ({
        name: `${x.name} ${x.patronym ? ` ${x.patronym}` : ""} ${x.surname}`,
        providerDetailId: x.provider_detail_id,
      }));
    },
  });
};
export default useGetAllProviderNames;
