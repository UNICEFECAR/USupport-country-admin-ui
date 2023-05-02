import { useMutation } from "@tanstack/react-query";
import { adminSvc } from "@USupport-components-library/services";
import { useError } from "#hooks";

export default function useDeleteQuestion(onSuccess, onError) {
  const deleteQuestion = async ({ questionId }) => {
    const { data } = await adminSvc.deleteQuestion(questionId);
    return data;
  };

  const deleteQuestionMutation = useMutation(deleteQuestion, {
    onSuccess: () => onSuccess("delete"),
    onError: (err) => {
      const { message: error } = useError(err);
      onError(error);
    },
  });
  return deleteQuestionMutation;
}

export { useDeleteQuestion };
