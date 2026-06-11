import { queryOptions, useQuery } from "@tanstack/react-query";
import { getBatches } from "../lib/action";

export const getBatchesQuery = () =>
  queryOptions({
    queryKey: ["all-batches"],
    queryFn: async () => {
      const res = await getBatches();
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.data;
    },
    retry: false,
  });

export const useGetBatches = () => {
  return useQuery(getBatchesQuery());
};
