import { z } from "zod";

export const addSemesterAdmissionOpenSchema = z
  .object({
    academicSessionId: z
      .string()
      .min(1, { message: "Academic session is required" }),
    semesterCount: z
      .number()
      .int()
      .min(1, { message: "Semester count must be at least 1" })
      .max(8, { message: "Semester count must be at most 8" }),
    startDate: z.string().min(1, { message: "Start date is required" }),
    endDate: z.string().min(1, { message: "End date is required" }),
    practicalFee: z
      .number()
      .int()
      .min(0, { message: "Practical fee must be non-negative" })
      .nullable()
      .optional(),
    lateFee: z
      .number()
      .int()
      .min(0, { message: "Late fee must be non-negative" })
      .default(0),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) {
        return true;
      }
      return new Date(data.endDate) >= new Date(data.startDate);
    },
    { message: "End date must be on or after start date", path: ["endDate"] },
  );

export const updateSemesterAdmissionOpenSchema = z
  .object({
    id: z.string().min(1, { message: "Id is required" }),
    academicSessionId: z
      .string()
      .min(1, { message: "Academic session is required" }),
    semesterCount: z
      .number()
      .int()
      .min(1, { message: "Semester count must be at least 1" })
      .max(8, { message: "Semester count must be at most 8" }),
    startDate: z.string().min(1, { message: "Start date is required" }),
    endDate: z.string().min(1, { message: "End date is required" }),
    practicalFee: z
      .number()
      .int()
      .min(0, { message: "Practical fee must be non-negative" })
      .nullable()
      .optional(),
    lateFee: z
      .number()
      .int()
      .min(0, { message: "Late fee must be non-negative" })
      .default(0),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) {
        return true;
      }
      return new Date(data.endDate) >= new Date(data.startDate);
    },
    { message: "End date must be on or after start date", path: ["endDate"] },
  );

export type AddSemesterAdmissionOpenSchema = z.infer<
  typeof addSemesterAdmissionOpenSchema
>;
export type UpdateSemesterAdmissionOpenSchema = z.infer<
  typeof updateSemesterAdmissionOpenSchema
>;
