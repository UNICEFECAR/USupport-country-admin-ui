import { useQuery } from "@tanstack/react-query";
import { adminSvc } from "@USupport-components-library/services";

export function useGetCouponsData(campaignId) {
  const fetchData = async () => {
    const { data } = await adminSvc.getCouponsData(campaignId);
    return data.map((coupon) => {
      const providerData = coupon.provider_data;
      return {
        createdAt: new Date(coupon.created_at),
        providerName: `${providerData.name} ${providerData.patronym} ${providerData.surname}`,
      };
    });
  };
  const couponsDataQuery = useQuery(["coupons-data"], fetchData);

  return couponsDataQuery;
}
