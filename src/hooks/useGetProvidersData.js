import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { adminSvc } from "@USupport-components-library/services";

/**
 * Reuseable hook to get and transform the client data in a desired format
 */
export default function useGetProvidersData() {
  //   const queryClient = useQueryClient();
  const [providersData, setProvidersData] = useState();
  const fetchProvidersData = async () => {
    const { data } = await adminSvc.getAllProviders();
    const formattedData = [];
    for (let i = 0; i < data.length; i++) {
      const providerData = data[i];
      const formattedProvider = {
        providerDetailId: providerData.provider_detail_id || "",
        name: providerData.name || "",
        patronym: providerData.patronym || "",
        surname: providerData.surname || "",
        nickname: providerData.nickname || "",
        email: providerData.email || "",
        image: providerData.image || "default",
        specializations: providerData.specializations || [],
        consultationPrice: providerData.consultation_price || 0,
        status: providerData.status,
      };
      formattedData.push(formattedProvider);
    }
    return formattedData;
  };

  const providersDataQuery = useQuery(["all-providers"], fetchProvidersData, {
    onSuccess: (data) => {
      const dataCopy = JSON.parse(JSON.stringify(data));
      setProvidersData([...dataCopy]);
    },
    notifyOnChangeProps: ["data"],
  });

  return [providersDataQuery, providersData, setProvidersData];
}

export { useGetProvidersData };
