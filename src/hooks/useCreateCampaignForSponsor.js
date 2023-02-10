import { useMutation } from "@tanstack/react-query";
import { adminSvc } from "@USupport-components-library/services";
import { useError } from "./useError";

export const useCreateCampaignForSponsor = (onSuccess, onError) => {
  const createCampaignForSponsor = async (payload) => {
    payload.startDate = JSON.stringify(
      new Date(payload.startDate).getTime() / 1000
    );
    payload.endDate = JSON.stringify(
      new Date(payload.endDate).getTime() / 1000
    );
    payload.maxCouponsPerClient = Number(payload.maxCouponsPerClient);
    payload.budget = Number(payload.budget);
    payload.numberOfCoupons = Number(payload.numberOfCoupons);
    const { data } = await adminSvc.createCampaignForSponsor(payload);
    return data;
  };

  const createCampaignForSponsorMutation = useMutation(
    createCampaignForSponsor,
    {
      onSuccess,
      onError: (err) => {
        const { message: error } = useError(err);
        console.log(error);
        onError(error);
      },
    }
  );

  return createCampaignForSponsorMutation;
};
