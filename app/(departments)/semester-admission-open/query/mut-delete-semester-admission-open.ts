import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteSemesterAdmissionOpen } from "../lib/action";
import { getSemesterAdmissionOpensQuery } from "./get-semester-admission-opens";

export const useDeleteSemesterAdmissionOpen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSemesterAdmissionOpen,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getSemesterAdmissionOpensQuery().queryKey,
      });
    },
  });
};
