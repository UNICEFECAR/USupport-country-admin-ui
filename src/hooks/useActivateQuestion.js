import { useMutation } from "@tanstack/react-query";
import { adminSvc } from "@USupport-components-library/services";
import { useError } from "#hooks";

export default function useActivateQuestion(onSuccess, onError) {
  const activateQuestion = async ({ questionId }) => {
    const { data } = await adminSvc.activateQuestion(questionId);
    return data;
  };

  const activateQuestionMutation = useMutation(activateQuestion, {
    onSuccess: () => onSuccess("activate"),
    onError: (err) => {
      const { message: error } = useError(err);
      onError(error);
    },
  });
  return activateQuestionMutation;
}

export { useActivateQuestion };
