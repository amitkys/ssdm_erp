import { z } from "zod";

export const certificateTypeEnum = [
  "CLC_CHARACTER",
  "CHARACTER",
  "BONAFIDE",
] as const;

export type CertificateType = (typeof certificateTypeEnum)[number];

/** Human-readable labels for each certificate type */
export const certificateTypeLabels: Record<CertificateType, string> = {
  CLC_CHARACTER: "CLC + Character Certificate",
  CHARACTER: "Character Certificate",
  BONAFIDE: "Bonafide Certificate",
};

export const createCertificateRequestSchema = z.object({
  studentId: z.string().min(1, { message: "Student ID is required" }),
  certificateType: z.enum(certificateTypeEnum, {
    message: "Select a certificate type",
  }),
  fee: z.number().min(1, { message: "Fee is required" }),
  transactionId: z.string().min(1, { message: "Transaction ID is required" }),
  purpose: z.string().min(1, { message: "Purpose is required" }),
  behaviour: z.string().optional(),
  division: z.string().optional(),
  passingMonth: z.string().optional(),
  passingYear: z.string().optional(),
});

export type CreateCertificateRequestSchema = z.infer<
  typeof createCertificateRequestSchema
>;
