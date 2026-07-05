import { queryOptions } from "@tanstack/react-query";
import { getCertificateMetaData } from "../lib/actions";

export function certificateMetaQueryOptions() {
  return queryOptions({
    queryKey: ["certificate-meta"],
    queryFn: async () => {
      const res = await getCertificateMetaData();
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.data;
    },
    retry: false,
  });
}
