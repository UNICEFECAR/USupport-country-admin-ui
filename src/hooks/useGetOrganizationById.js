import { useQuery } from "@tanstack/react-query";
import { organizationSvc } from "@USupport-components-library/services";

export const useGetOrganizationById = (organizationId) => {
  return useQuery({
    queryKey: ["GetOrganizationById", organizationId],
    queryFn: async () => {
      const data = await organizationSvc.getOrganizationById(organizationId);

      const { totalClients, totalConsultations } = data.providers.reduce(
        (acc, provider) => {
          acc.totalClients += Number(provider.clients_count);
          acc.totalConsultations += Number(provider.consultations_count);
          return acc;
        },
        { totalClients: 0, totalConsultations: 0 }
      );

      return {
        ...data,
        organizationId: data.organization_id,
        totalClients,
        totalConsultations,
        providers: data.providers.map((x) => ({
          providerDetailId: x.providerDetailId,
          joinDate: x.provider_join_date,
          name: `${x.name} ${x.patronym ? ` ${x.patronym}` : ""} ${x.surname}`,
          image: x.image,
          email: x.email,
          consultations: x.consultations_count,
          clients: x.clients_count,
        })),
      };
    },
  });
};
export default useGetOrganizationById;
