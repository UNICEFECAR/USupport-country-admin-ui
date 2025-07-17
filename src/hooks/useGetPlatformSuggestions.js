import { useQuery } from "@tanstack/react-query";
import { adminSvc } from "@USupport-components-library/services";

export const useGetPlatformSuggestions = (type) => {
  const getPlatformSuggestions = async () => {
    const { data } = await adminSvc.getPlatformSuggestions(type);
    return data.map((item) => {
      return {
        suggestion: item.suggestion,
        type: item.type,
        createdAt: new Date(item.created_at),
        clientEmail: item.email,
        clientName: item.name ? `${item.name} ${item.surname}` : null,
        clientNickname: item.nickname,
      };
    });
  };

  return useQuery(["platform-suggestions", type], getPlatformSuggestions, {
    enabled: !!type,
  });
};
