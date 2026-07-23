import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSemesterAdmissionOpen } from "../lib/action";
import { getSemesterAdmissionOpensQuery } from "./get-semester-admission-opens";

export const useUpdateSemesterAdmissionOpen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSemesterAdmissionOpen,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getSemesterAdmissionOpensQuery().queryKey,
      });
    },
  });
};
