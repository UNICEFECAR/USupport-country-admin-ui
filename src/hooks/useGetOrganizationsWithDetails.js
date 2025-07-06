import { useQuery } from "@tanstack/react-query";
import { organizationSvc } from "@USupport-components-library/services";

export const useGetOrganizationsWithDetails = ({ search }) => {
  return useQuery({
    queryKey: ["GetOrganizationsWithDetails", search],
    queryFn: async () => {
      const data = await organizationSvc.getOrganizationsWithDetails(search);

      return data.map((x) => ({
        organizationId: x.organization_id,
        name: x.name,
        unitName: x.unit_name,
        websiteUrl: x.website_url,
        address: x.address,
        phone: x.phone,
        email: x.email,
        description: x.description,
        createdBy: x.created_by,
        createdAt: x.created_at,
        location: {
          longitude: x?.longitude,
          latitude: x?.latitude,
        },
        district: {
          id: x?.district_id,
          name: x?.district,
        },
        paymentMethod: {
          id: x?.payment_method_id,
          name: x?.payment_method,
        },
        userInteraction: {
          id: x?.user_interaction_id,
          name: x?.user_interaction,
        },
        workWith: x?.work_with || [],
        providers: x?.providers || [],
        specialisations: x?.specialisations || [],
        totalConsultations: x?.totalConsultations || 0,
        uniqueProviders: x?.uniqueProviders || 0,
        uniqueClients: x?.uniqueClients || 0,
      }));
    },
  });
};

export default useGetOrganizationsWithDetails;
