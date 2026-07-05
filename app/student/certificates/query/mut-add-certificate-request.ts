import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCertificateRequest } from "../lib/actions";
import type { CreateCertificateRequestSchema } from "../lib/zod-type/certificate-request-type";

export function useMutAddCertificateRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCertificateRequestSchema) => {
      const res = await createCertificateRequest(data);
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificate-requests"] });
    },
  });
}
