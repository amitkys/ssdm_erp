import { queryOptions, useQuery } from "@tanstack/react-query";
import { getAcademicSessions } from "../lib/action";

export const getAcademicSessionsQuery = () =>
  queryOptions({
    queryKey: ["academic-sessions-for-semester"],
    queryFn: () => getAcademicSessions().then((res) => res.data ?? []),
  });

export const useGetAcademicSessions = () => {
  return useQuery(getAcademicSessionsQuery());
};
