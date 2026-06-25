import { z } from "zod";

export const addMiscPaymentSchema = z.object({
  reason: z.string().min(1, { message: "Miscellaneous reason is required" }),
  name: z.string().min(1, { message: "Name is required" }),
  amount: z.coerce.number().min(1, { message: "Amount must be at least 1" }),
  address: z.string().min(1, { message: "Address is required" }),
  purpose: z.string().min(1, { message: "Purpose is required" }),
});

export type AddMiscPaymentSchema = z.infer<typeof addMiscPaymentSchema>;
