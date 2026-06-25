import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addSemesterAdmissionOpen } from "../lib/action";
import { getSemesterAdmissionOpensQuery } from "./get-semester-admission-opens";

export const useAddSemesterAdmissionOpen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addSemesterAdmissionOpen,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getSemesterAdmissionOpensQuery().queryKey,
      });
    },
  });
};
