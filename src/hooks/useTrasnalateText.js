import { useMutation } from "@tanstack/react-query";
import { organizationSvc } from "@USupport-components-library/services";
import { useError } from "./useError";

/**
 * Hook for translating text using Google Translate API
 * @param {Function} onSuccess - Callback function on successful translation
 * @param {Function} onError - Callback function on error
 * @returns {Object} - React Query mutation object
 *
 * @example
 * const { mutate: translateText, isLoading } = useTranslateText(
 *   (data) => console.log(data.translatedText),
 *   (error) => console.error(error)
 * );
 *
 * translateText({
 *   text: "Hello, how are you?",
 *   sourceLanguage: "en",
 *   targetLanguage: "uk"
 * });
 */
export const useTranslateText = (onSuccess, onError) => {
  return useMutation({
    mutationFn: async (data) => {
      return await organizationSvc.translateText(data);
    },
    onSuccess,
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      onError(errorMessage);
    },
  });
};

export default useTranslateText;


