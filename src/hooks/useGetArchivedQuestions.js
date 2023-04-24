import { useQuery } from "@tanstack/react-query";
import { adminSvc } from "@USupport-components-library/services";

export default function useGetArchivedQuestions() {
  const fetchArchivedQuestions = async () => {
    const { data } = await adminSvc.getArchivedQuestions();
    return data.map((question) => {
      return {
        questionId: question.question_id,
        createdAt: question.created_at,
        additionalText: question.additional_text,
        ...question,
      };
    });
  };

  const query = useQuery(["archived-questions"], fetchArchivedQuestions);
  return query;
}

export { useGetArchivedQuestions };
