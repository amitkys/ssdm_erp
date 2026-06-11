import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAdmissionOpen } from "../lib/action";
import type { UpdateAdmissionOpenSchema } from "../lib/zod-type/admission-open-type";

export function useUpdateAdmissionOpen() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateAdmissionOpenSchema) => {
      const res = await updateAdmissionOpen(input);
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
