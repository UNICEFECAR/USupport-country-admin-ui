import { useQuery } from "@tanstack/react-query";
import {
  getDateView,
  getTimeAsString,
  ONE_HOUR,
} from "@USupport-components-library/utils";

export const useGetCampaignDetails = (campaignId) => {
  const getCampaignDetails = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const data = {
      campaignName: "Unicef23",
      status: "active",
      startDate: getDateView(new Date(1668895200000)),
      endDate: getDateView(new Date(1700604000000)),
      code: "UNI23",
      budget: 500,
      totalCoupons: 100,
      usedCoupons: 50,
      maxCouponsPerUser: 3,
      termsAndConditions: "Lorem ipsum dolor sit amet",
      usedCouponsData: [
        {
          id: 1,
          providerData: {
            providerDetailId: "providerId-1",
            providerName: "Dr. John doe",
          },
          usedOn: `${getTimeAsString(
            new Date(1669845600000)
          )} - ${getTimeAsString(
            new Date(1669845600000 + ONE_HOUR)
          )}, ${getDateView(new Date(1669845600000))}`,
        },
        {
          id: 2,
          providerData: {
            providerDetailId: "providerId-1",
            providerName: "Dr. John doe",
          },
          usedOn: `${getTimeAsString(
            new Date(1671055200000)
          )} - ${getTimeAsString(
            new Date(1671055200000 + ONE_HOUR)
          )}, ${getDateView(new Date(1671055200000))}`,
        },
        {
          id: 3,
          providerData: {
            providerDetailId: "providerId-2",
            providerName: "Dr. John doe 2",
          },
          usedOn: `${getTimeAsString(
            new Date(1681055200000)
          )} - ${getTimeAsString(
            new Date(1681055200000 + ONE_HOUR)
          )}, ${getDateView(new Date(1681055200000))}`,
        },
      ],
    };

    data["pricePerCoupon"] = data.budget / data.totalCoupons;
    data["usedBudget"] = data.pricePerCoupon * data.usedCoupons;

    return data;
  };

  return useQuery(["campaignDetails", campaignId], getCampaignDetails, {
    enabled: !!campaignId,
  });
};
