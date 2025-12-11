import { useQuery } from "@tanstack/react-query";
import { organizationSvc } from "@USupport-components-library/services";

export const useGetOrganizationsWithDetails = (filters) => {
  return useQuery({
    queryKey: ["GetOrganizationsWithDetails", filters],
    queryFn: async () => {
      const data = await organizationSvc.getOrganizationsWithDetails(filters);

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
        paymentMethods: x?.payment_methods || [],
        userInteractions: x?.user_interactions || [],
        propertyTypes: x?.property_types || [],
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
