import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateStudentDetails } from "@/app/(departments)/promote-students/lib/action";
import type { EditStudentSchema } from "../lib/zod-type/edit-student-type";

export function useMutUpdateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      studentId,
      data,
    }: {
      studentId: string;
      data: Omit<EditStudentSchema, "id">;
    }) => {
      const res = await updateStudentDetails(studentId, data);
      if (!res.success) {
        throw new Error(res.message || "Failed to update student details");
      }
      return res;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admitted-students"] });
      queryClient.invalidateQueries({ queryKey: ["admitted-students-search"] });
      toast.success(data.message || "Successfully updated student details.");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
}
