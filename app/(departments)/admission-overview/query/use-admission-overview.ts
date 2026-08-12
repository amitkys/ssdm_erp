import { useQuery } from "@tanstack/react-query";
import {
  getAdmissionOverviewFilterOptions,
  getAdmissionOverviewStats,
} from "../lib/action";

export function useAdmissionOverviewFilterOptions() {
  return useQuery({
    queryKey: ["admission-overview-filter-options"],
    queryFn: async () => {
      const res = await getAdmissionOverviewFilterOptions();
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.data;
    },
    retry: false,
  });
}

export function useAdmissionOverviewStats(
  sessionId: string,
  semesterCount: number,
) {
  return useQuery({
    queryKey: ["admission-overview-stats", sessionId, semesterCount],
    queryFn: async () => {
      const res = await getAdmissionOverviewStats(sessionId, semesterCount);
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.data;
    },
    enabled: !!sessionId && !!semesterCount,
    retry: false,
  });
}
