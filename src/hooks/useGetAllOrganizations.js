import { useQuery } from "@tanstack/react-query";
import { organizationSvc } from "@USupport-components-library/services";

export default function useGetAllOrganizations() {
  return useQuery(["organizations"], async () => {
    const data = await organizationSvc.getAllOrganizations();

    return data.map((x) => ({
      ...x,
      organizationId: x.organization_id,
      unitName: x.unit_name,
      websiteUrl: x.website_url,
      address: x.address,
      phone: x.phone,
      email: x.email,
      description: x.description,
      specialisations: x.specialisations,
      paymentMethods: x.payment_methods || [],
      userInteractions: x.user_interactions || [],
      propertyTypes: x.property_types || [],
      location: {
        longitude: x?.longitude,
        latitude: x?.latitude,
      },
      district: x.district_id,
    }));
  });
}

export { useGetAllOrganizations };
