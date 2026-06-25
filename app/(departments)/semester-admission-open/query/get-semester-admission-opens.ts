import { queryOptions, useQuery } from "@tanstack/react-query";
import { getSemesterAdmissionOpens } from "../lib/action";

export const getSemesterAdmissionOpensQuery = () =>
  queryOptions({
    queryKey: ["semester-admission-opens"],
    queryFn: () => getSemesterAdmissionOpens().then((res) => res.data ?? []),
  });

export const useGetSemesterAdmissionOpens = () => {
  return useQuery(getSemesterAdmissionOpensQuery());
};
