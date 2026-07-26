import { z } from "zod";

export const enrollStudentSchema = z.object({
  // Filter Dropdowns
  sessionId: z.string().min(1, "Academic Session is required"),
  batchId: z.string().min(1, "Batch is required"),
  subMJC: z.string().min(1, "MJC Subject is required"),

  // Required Student Data
  UAN: z.string().min(1, "UAN is required").trim(),
  admissionType: z.enum(["MERIT", "SPOT", "MANAGEMENT QUOTA", "OTHER"]),
  registrationNumber: z
    .string()
    .min(1, "Registration Number is required")
    .trim(),
  name: z.string().min(1, "Student Name is required").trim(),
  gender: z.enum(["Male", "Female", "Transgender"]),
  reservation: z.string().min(1, "Reservation Category is required").trim(),

  // Optional Student Data (as input strings from form)
  ABCID: z.string().optional(),
  caste: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
});

export type EnrollStudentInput = z.infer<typeof enrollStudentSchema>;
