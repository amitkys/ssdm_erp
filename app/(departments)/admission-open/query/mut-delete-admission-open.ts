import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAdmissionOpen } from "../lib/action";

export function useDeleteAdmissionOpen() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteAdmissionOpen(id);
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
