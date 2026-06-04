import { fetchEnrolledStudent } from "../lib/action";

export function verifyEnrolledStudentMutationOptions(batchId: string) {
  return {
    mutationKey: ["verify_enrolled_student", batchId],
    mutationFn: async (UAN: string) => {
      const res = await fetchEnrolledStudent({ UAN, batchId });
      if (!res.success) {
        throw new Error(res.message);
      }
      return res;
    },
    retry: false,
  };
}
