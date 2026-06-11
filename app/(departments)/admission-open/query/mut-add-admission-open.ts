import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addAdmissionOpen } from "../lib/action";
import type { AddAdmissionOpenSchema } from "../lib/zod-type/admission-open-type";

export function useAddAdmissionOpen() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddAdmissionOpenSchema) => {
      const res = await addAdmissionOpen(input);
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admission-opens"] });
    },
  });
}
