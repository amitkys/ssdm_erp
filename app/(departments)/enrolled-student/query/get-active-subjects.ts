import { queryOptions, useQuery } from "@tanstack/react-query";
import { fetchActiveSubjects } from "../lib/action";

export const getActiveSubjectsQuery = () =>
  queryOptions({
    queryKey: ["active-subjects"],
    queryFn: async () => {
      const res = await fetchActiveSubjects();
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.subjects || [];
    },
    retry: false,
  });

export const useGetActiveSubjects = () => {
  return useQuery(getActiveSubjectsQuery());
};
