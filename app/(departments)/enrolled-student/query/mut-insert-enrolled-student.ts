import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { insertEnrolledStudent } from "../lib/action";
import type { EnrollStudentInput } from "../lib/zod-type/enroll-student";

export function useMutInsertEnrolledStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: EnrollStudentInput) => {
      const res = await insertEnrolledStudent(input);
      if (!res.success) {
        throw new Error(res.message || "Failed to enroll student.");
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrolled-students"] });
      toast.success("Student enrolled successfully!");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
}
