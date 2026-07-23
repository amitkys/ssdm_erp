import * as z from "zod";

export const editStudentZodSchema = z.object({
  id: z.string().min(1, "Student ID is required"),
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().length(10, "Phone number must be exactly 10 digits"),
  gender: z.enum(["Male", "Female", "Transgender"]),
  DOB: z.string().min(1, "Date of Birth is required"),
  AadharNumber: z
    .string()
    .length(12, "Aadhar Number must be exactly 12 digits"),
  ABCID: z.string().optional().nullable(),
  fathersName: z.string().min(1, "Father's Name is required"),
  mothersName: z.string().min(1, "Mother's Name is required"),
  religion: z.string().min(1, "Religion is required"),
  caste: z.enum(["GEN", "BC", "EBC", "SC", "ST", "OTHER"]),
  admissionType: z.enum(["MERIT", "SPORT", "MANAGEMENT QUOTA", "OTHER"]),
  registrationNumber: z.string().optional().nullable(),
  universityRoll: z.string().optional().nullable(),
  city: z.string().min(1, "City is required"),
  district: z.string().min(1, "District is required"),
  state: z.string().min(1, "State is required"),
  pinCode: z
    .number()
    .int()
    .min(100000, "Pin Code must be 6 digits")
    .max(999999, "Pin Code must be 6 digits"),
});

export type EditStudentSchema = z.infer<typeof editStudentZodSchema>;
