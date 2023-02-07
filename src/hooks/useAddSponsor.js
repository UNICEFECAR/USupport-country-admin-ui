import { useMutation } from "@tanstack/react-query";
import { adminSvc } from "@USupport-components-library/services";

import useError from "./useError";

export const useAddSponsor = (onSuccess = () => {}, onError = () => {}) => {
  const addSponsor = async (sponsorData) => {
    const { data } = await adminSvc.addSponsor(sponsorData);
    return data;
  };

  const addSponsorQuery = useMutation(["add-sponsor"], addSponsor, {
    onError: (err) => {
      const { message: error } = useError(err);
      onError(error);
    },
    onSuccess,
  });

  return addSponsorQuery;
};
