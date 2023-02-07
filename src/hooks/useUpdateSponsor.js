import { useMutation } from "@tanstack/react-query";
import { adminSvc } from "@USupport-components-library/services";

import useError from "./useError";

export const useUpdateSponsor = (onSuccess = () => {}, onError = () => {}) => {
  const updateSponsor = async (sponsorData) => {
    const { data } = await adminSvc.updateSponsor(sponsorData);
    return data;
  };

  const updateSponsorQuery = useMutation(["update-sponsor"], updateSponsor, {
    onError: (err) => {
      const { error } = useError(err);
      onError(error);
    },
    onSuccess,
  });

  return updateSponsorQuery;
};
