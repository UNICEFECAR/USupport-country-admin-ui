import { useQuery } from "@tanstack/react-query";

import { adminSvc } from "@USupport-components-library/services";

const QUERY_KEY = ["countryPinnedArticles"];

/**
 * Romania (and future) pinned article ids stored on country in master DB.
 * @param {boolean} enabled
 */
export function useCountryPinnedArticles(enabled) {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => adminSvc.getPinnedArticles(),
    enabled: Boolean(enabled),
    refetchOnWindowFocus: false,
  });
}

export { QUERY_KEY as COUNTRY_PINNED_ARTICLES_QUERY_KEY };
