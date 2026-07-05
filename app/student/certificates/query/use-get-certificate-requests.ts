import { queryOptions } from "@tanstack/react-query";
import { getStudentCertificateRequests } from "../lib/actions";

export function certificateRequestsQueryOptions(studentId: string) {
  return queryOptions({
    queryKey: ["certificate-requests", studentId],
    queryFn: async () => {
      const res = await getStudentCertificateRequests(studentId);
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.data;
    },
    retry: false,
  });
}
