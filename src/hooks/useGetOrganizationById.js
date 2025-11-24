import { useQuery } from "@tanstack/react-query";
import { organizationSvc } from "@USupport-components-library/services";

export const useGetOrganizationById = (organizationId, filters) => {
  const {
    startDate,
    endDate,
    startTime,
    endTime,
    weekdays,
    weekends,
    search,
    timeZone,
  } = filters;

  return useQuery({
    queryKey: [
      "GetOrganizationById",
      organizationId,
      startDate,
      endDate,
      startTime,
      endTime,
      weekdays,
      weekends,
      search,
      timeZone,
    ],
    queryFn: async () => {
      const data = await organizationSvc.getOrganizationById(
        organizationId,
        filters
      );

      const { totalClients, totalConsultations } = data.providers.reduce(
        (acc, provider) => {
          acc.totalClients += Number(provider.clients_count || 0);
          acc.totalConsultations += Number(provider.consultations_count || 0);
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
          providerDetailId: x.provider_detail_id,
          joinDate: x.provider_join_date,
          leaveDate: x.provider_leave_date,
          name: `${x.name} ${x.patronym ? ` ${x.patronym}` : ""} ${x.surname}`,
          image: x.image,
          email: x.email,
          consultations_count: x.consultations_count || 0,
          consultations: x.consultations || [],
          clients: x.clients_count || 0,
          futureConsultations: Number(x.future_consultations || 0),
        })),
        specialisations: data.specialisations || [],
        paymentMethods: data.payment_methods || [],
        userInteractions: data.user_interactions || [],
        propertyTypes: data.property_types || [],
      };
    },
    enabled: !!organizationId,
  });
};

export default useGetOrganizationById;
