import { useQuery } from "@tanstack/react-query";
import { cmsSvc } from "@USupport-components-library/services";

export const useGetContentStatistics = () => {
  const getAllCategoriesStatistics = async () => {
    try {
      const response = await cmsSvc.getAllCategoriesStatistics();
      return response.data;
    } catch (error) {
      console.error("Error fetching category statistics:", error);
      throw error;
    }
  };

  return useQuery(["all-categories-statistics"], getAllCategoriesStatistics);
};
