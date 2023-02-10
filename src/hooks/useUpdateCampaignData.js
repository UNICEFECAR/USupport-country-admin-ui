import { useMutation } from "@tanstack/react-query";
import { adminSvc } from "@USupport-components-library/services";
import { useError } from "./useError";

export const useUpdateCampaignData = (onSuccess, onError) => {
  const updateCampaignData = async (payload) => {
    payload.startDate = JSON.stringify(
      new Date(payload.startDate).getTime() / 1000
    );
    payload.endDate = JSON.stringify(
      new Date(payload.endDate).getTime() / 1000
    );
    payload.maxCouponsPerClient = Number(payload.maxCouponsPerClient);
    payload.budget = Number(payload.budget);
    payload.numberOfCoupons = Number(payload.numberOfCoupons);

    delete payload.usedCoupons;
    delete payload.usedBudget;
    delete payload.couponPrice;
    delete payload.couponData;
    const { data: updatedData } = await adminSvc.updateCampaignData(payload);
    return updatedData;
  };

  const updateCampaignDataMutation = useMutation(updateCampaignData, {
    onSuccess,
    onError: (err) => {
      const { message: error } = useError(err);
      onError(error);
    },
  });

  return updateCampaignDataMutation;
};
