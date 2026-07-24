import { queryOptions } from "@tanstack/react-query";
import {
  getCertificateTypes,
  getStudentCertificateRequests,
} from "../lib/actions";

export const getCertificateTypesQuery = () =>
  queryOptions({
    queryKey: ["certificate-types"],
    queryFn: async () => {
      const res = await getCertificateTypes();
      if (!res.success) throw new Error(res.message);
      return res.data || [];
    },
  });

export const getStudentCertificateRequestsQuery = () =>
  queryOptions({
    queryKey: ["student-certificate-requests"],
    queryFn: async () => {
      const res = await getStudentCertificateRequests();
      if (!res.success) throw new Error(res.message);
      return res;
    },
  });
