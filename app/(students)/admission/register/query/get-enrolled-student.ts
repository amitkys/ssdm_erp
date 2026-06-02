import { queryOptions } from "@tanstack/react-query";
import { fetchEnrolledStudent } from "../lib/action";


export function getEnrolledStudent({UAN, sessionId, courseId}: {UAN: string, sessionId: string, courseId: string}) {
  return queryOptions({
    queryKey: [
      "enrolled_student",
    ],
    queryFn: async () => {
      const res = await fetchEnrolledStudent({UAN, sessionId, courseId});
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.data;
    },
    retry: false,
  });
}
