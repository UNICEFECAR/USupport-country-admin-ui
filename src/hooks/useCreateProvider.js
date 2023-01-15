import { useMutation } from "@tanstack/react-query";
import { userSvc } from "@USupport-components-library/services";
import { useError } from "./useError";

/**
 * Reuseable hook to get and transform the provider data in a desired format
 */
export default function useCreateProvider(onSuccess, onError) {
  const transformPayload = (payload) => {
    const newPayload = { ...payload };
    newPayload.workWithIds = newPayload.workWith.map((item) => {
      if (typeof item === "object") {
        return item.work_with_id;
      } else {
        return item;
      }
    });

    newPayload.languageIds = newPayload.languages.map((item) => {
      if (typeof item === "object") {
        return item.language_id;
      } else {
        return item;
      }
    });

    newPayload.consultationPrice = Number(newPayload.consultationPrice);
    newPayload.email = newPayload.email.toLowerCase();

    delete newPayload.workWith;
    delete newPayload.languages;
    delete newPayload.providerDetailId;
    delete newPayload.image;
    delete newPayload.totalConsultations;
    delete newPayload.earliestAvailableSlot;
    return newPayload;
  };

  const createProvider = async (payload) => {
    const transformedPayload = transformPayload(payload);
    const { data } = await userSvc.createProvider(transformedPayload);
    return data;
  };

  const createProviderMutation = useMutation(createProvider, {
    onSuccess: (data) => {
      onSuccess(data);
    },
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      onError(errorMessage);
    },
  });
  return createProviderMutation;
}

export { useCreateProvider };
