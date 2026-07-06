import { queryOptions, useQuery } from "@tanstack/react-query";
import { getStudentFeeData } from "../lib/action";

export const getStudentFeeDataQuery = () =>
  queryOptions({
    queryKey: ["student-fee-data"],
    queryFn: () =>
      getStudentFeeData().then((res) => {
        if (!res.success) {
          throw new Error(res.message || "Failed to fetch student fee data");
        }
        return res.data;
      }),
  });

export const useGetStudentFeeData = () => {
  return useQuery(getStudentFeeDataQuery());
};
