import { useQuery } from "@tanstack/react-query";
import { providerSvc } from "@USupport-components-library/services";

export default function useGetProviderTranslations(providerId) {
  return useQuery(
    ["provider-translations", providerId],
    async () => {
      const { data } = await providerSvc.getProviderTranslations(providerId);
      return data;
    },
    {
      enabled: !!providerId,
      staleTime: Infinity,
    }
  );
}

export { useGetProviderTranslations };
