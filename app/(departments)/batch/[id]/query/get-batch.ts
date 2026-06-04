import { queryOptions } from "@tanstack/react-query";
import { fetchBatchesByCourse } from "../lib/action";

export function getBatchesByCourse(courseId: string) {
  return queryOptions({
    queryKey: ["batches-by-course", courseId],
    queryFn: async () => {
      const res = await fetchBatchesByCourse(courseId);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    retry: false,
  });
}

// Keep old export so existing imports don't break
export function getBatchSemesters({ id }: { id: string }) {
  return queryOptions({
    queryKey: ["semester", id],
    queryFn: async () => {
      const { fetchSemestersByBatch } = await import("../lib/action");
      const res = await fetchSemestersByBatch(id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    retry: false,
  });
}