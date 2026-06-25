import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMiscPayment } from "../lib/actions";
import type { AddMiscPaymentSchema } from "../lib/zod-type/misc-payment-type";

export function useMutAddMiscPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AddMiscPaymentSchema) => {
      const res = await createMiscPayment(data);
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["misc-payments"] });
    },
  });
}
