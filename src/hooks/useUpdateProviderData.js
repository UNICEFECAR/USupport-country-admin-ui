import { useMutation, useQueryClient } from "@tanstack/react-query";
import { providerSvc } from "@USupport-components-library/services";
import { useError } from "./useError";

/**
 * Reuseable hook to get and transform the provider data in a desired format
 */
export default function useUpdateProviderData(onSuccess, onError) {
  const queryClient = useQueryClient();

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

    newPayload.organizationIds = newPayload.organizations.map((item) => {
      if (typeof item === "object") {
        return item.organization_id;
      } else {
        return item;
      }
    });

    newPayload.consultationPrice = Number(newPayload.consultationPrice);
    newPayload.providerId = newPayload.providerDetailId;
    newPayload.email = newPayload.email.toLowerCase();

    delete newPayload.workWith;
    delete newPayload.languages;
    delete newPayload.providerDetailId;
    delete newPayload.image;
    delete newPayload.totalConsultations;
    delete newPayload.earliestAvailableSlot;
    delete newPayload.organizations;
    return newPayload;
  };

  const updateProviderData = async (payload) => {
    const transformedPayload = transformPayload(payload);
    const { data } = await providerSvc.updateProviderDataByIdAsAdmin(
      transformedPayload
    );
    return data;
  };

  const updateProviderDataMutation = useMutation(updateProviderData, {
    onSuccess: (data) => {
      onSuccess(data);
      queryClient.invalidateQueries({ queryKey: ["provider-data"] });
    },
    onError: (error) => {
      const { message: errorMessage } = useError(error);

      const isFutureConsultationError =
        error?.response?.data?.error?.name ===
        "PROVIDER HAS FUTURE CONSULTATIONS";

      onError(errorMessage, isFutureConsultationError || false);
    },
  });
  return updateProviderDataMutation;
}

export { useUpdateProviderData };
