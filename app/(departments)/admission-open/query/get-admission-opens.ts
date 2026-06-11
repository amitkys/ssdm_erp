import { queryOptions, useQuery } from "@tanstack/react-query";
import { getAdmissionOpens } from "../lib/action";

export const getAdmissionOpensQuery = () =>
  queryOptions({
    queryKey: ["admission-opens"],
    queryFn: async () => {
      const res = await getAdmissionOpens();
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.data;
    },
    retry: false,
  });

export const useGetAdmissionOpens = () => {
  return useQuery(getAdmissionOpensQuery());
};
