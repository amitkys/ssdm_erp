"use server";

import { db } from "@/lib/db";
import { miscellaneousPaymentTable } from "@/lib/db/schema/miscellaneous";
import { desc, ilike, sql } from "drizzle-orm";
import { addMiscPaymentSchema } from "./zod-type/misc-payment-type";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

/**
 * Verify the secret code against the env variable.
 */
export async function verifySecretCode(code: string) {
  try {
    const secret = process.env.MISC_PAYMENT_SECRET_CODE;
    if (!secret) {
      return { success: false, message: "Secret code not configured on server" };
    }
    if (code !== secret) {
      return { success: false, message: "Invalid secret code" };
    }
    return { success: true, data: true };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error, "Failed to verify code"),
    };
  }
}

/**
 * Generate the next invoice number for the current year.
 * Format: MISC<4-digit-year><4-digit-serial>
 */
async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `MISC${year}`;

  const [result] = await db
    .select({
      maxInvoice: sql<string>`MAX(${miscellaneousPaymentTable.invoiceNumber})`,
    })
    .from(miscellaneousPaymentTable)
    .where(
      ilike(miscellaneousPaymentTable.invoiceNumber, `${prefix}%`),
    );

  let nextSerial = 1;
  if (result?.maxInvoice) {
    const currentSerial = Number.parseInt(
      result.maxInvoice.replace(prefix, ""),
      10,
    );
    if (!Number.isNaN(currentSerial)) {
      nextSerial = currentSerial + 1;
    }
  }

  return `${prefix}${String(nextSerial).padStart(4, "0")}`;
}

/**
 * Create a new miscellaneous payment record.
 */
export async function createMiscPayment(data: unknown) {
  try {
    const parsed = addMiscPaymentSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues.map((i) => i.message).join(", "),
      };
    }

    const invoiceNumber = await generateInvoiceNumber();

    const [record] = await db
      .insert(miscellaneousPaymentTable)
      .values({
        invoiceNumber,
        reason: parsed.data.reason,
        name: parsed.data.name,
        amount: parsed.data.amount,
        address: parsed.data.address,
        purpose: parsed.data.purpose,
      })
      .returning();

    return { success: true, data: record };
  } catch (error) {
    console.error("[createMiscPayment] Error:", error);
    return {
      success: false,
      message: getErrorMessage(error, "Failed to create payment"),
    };
  }
}

/**
 * Get all miscellaneous payments, ordered by newest first.
 */
export async function getMiscPayments() {
  try {
    const payments = await db
      .select()
      .from(miscellaneousPaymentTable)
      .orderBy(desc(miscellaneousPaymentTable.createdAt));

    return { success: true, data: payments };
  } catch (error) {
    console.error("[getMiscPayments] Error:", error);
    return {
      success: false,
      message: getErrorMessage(error, "Failed to fetch payments"),
    };
  }
}

/**
 * Search payments by invoice number (partial, case-insensitive).
 */
export async function searchMiscPaymentByInvoice(invoiceNumber: string) {
  try {
    if (!invoiceNumber.trim()) {
      return getMiscPayments();
    }

    const payments = await db
      .select()
      .from(miscellaneousPaymentTable)
      .where(
        ilike(
          miscellaneousPaymentTable.invoiceNumber,
          `%${invoiceNumber.trim()}%`,
        ),
      )
      .orderBy(desc(miscellaneousPaymentTable.createdAt));

    return { success: true, data: payments };
  } catch (error) {
    console.error("[searchMiscPaymentByInvoice] Error:", error);
    return {
      success: false,
      message: getErrorMessage(error, "Failed to search payments"),
    };
  }
}
