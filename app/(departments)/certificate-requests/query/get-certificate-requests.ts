import { queryOptions } from "@tanstack/react-query";
import { getAdminCertificateRequests } from "../lib/actions";

export const getAdminCertificateRequestsQuery = (params?: {
  status?: string;
  collegeRoll?: string;
}) =>
  queryOptions({
    queryKey: ["admin-certificate-requests", params?.status, params?.collegeRoll],
    queryFn: async () => {
      const res = await getAdminCertificateRequests(params);
      if (!res.success) throw new Error(res.message);
      return res.data || [];
    },
  });
