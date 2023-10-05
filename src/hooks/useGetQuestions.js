import { useQuery } from "@tanstack/react-query";
import { adminSvc } from "@USupport-components-library/services";

export default function useGetQuestions(type) {
  /**
   *
   * @returns
   */

  const fetchQuestions = async () => {
    const { data } = await adminSvc.getQuestions(type);

    return data.map((question) => {
      return {
        answerCreatedAt: question.answer_created_at,
        answerId: question.answer_id,
        answerText: question.answer_text,
        answerTitle: question.answer_title,
        dislikes: question.dislikes,
        isDisliked: question.isDisliked,
        isLiked: question.isLiked,
        likes: question.likes,
        providerData: question.providerData,
        providerDetailId: question.provider_detail_id,
        questionCreatedAt: question.question_created_at,
        questionId: question.question_id,
        question: question.question,
        tags: question.tags,
      };
    });
  };

  const query = useQuery(["questions", type], fetchQuestions);
  return query;
}

export { useGetQuestions };
