"use server";

import { headers } from "next/headers";
import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  CertificateMetaDataTable,
  CertificateRequestTable,
} from "@/lib/db/schema/certificate";
import { auth } from "@/lib/auth";
import { createCertificateRequestSchema } from "./zod-type/certificate-request-type";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

/**
 * Get the certificate fee configuration (single row).
 */
export async function getCertificateMetaData() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return { success: false as const, message: "Unauthorized" };
    }

    const [meta] = await db
      .select()
      .from(CertificateMetaDataTable)
      .limit(1);

    if (!meta) {
      return {
        success: false as const,
        message: "Certificate fee configuration not found. Contact admin.",
      };
    }

    return { success: true as const, data: meta };
  } catch (error) {
    console.error("[getCertificateMetaData] Error:", error);
    return {
      success: false as const,
      message: getErrorMessage(error, "Failed to fetch certificate fees"),
    };
  }
}

/**
 * Get all certificate requests for a specific student.
 */
export async function getStudentCertificateRequests(studentId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return { success: false as const, message: "Unauthorized" };
    }

    const requests = await db
      .select()
      .from(CertificateRequestTable)
      .where(eq(CertificateRequestTable.studentId, studentId))
      .orderBy(desc(CertificateRequestTable.createdAt));

    return { success: true as const, data: requests };
  } catch (error) {
    console.error("[getStudentCertificateRequests] Error:", error);
    return {
      success: false as const,
      message: getErrorMessage(error, "Failed to fetch certificate requests"),
    };
  }
}

/**
 * Create a new certificate request.
 */
export async function createCertificateRequest(data: unknown) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "student") {
      return { success: false as const, message: "Unauthorized" };
    }

    const parsed = createCertificateRequestSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false as const,
        message: parsed.error.issues.map((i) => i.message).join(", "),
      };
    }

    const [record] = await db
      .insert(CertificateRequestTable)
      .values({
        studentId: parsed.data.studentId,
        certificateType: parsed.data.certificateType,
        fee: parsed.data.fee,
        transactionId: parsed.data.transactionId,
        purpose: parsed.data.purpose,
        behaviour: parsed.data.behaviour ?? null,
        division: parsed.data.division ?? null,
        passingMonth: parsed.data.passingMonth ?? null,
        passingYear: parsed.data.passingYear ?? null,
      })
      .returning();

    return { success: true as const, data: record };
  } catch (error) {
    console.error("[createCertificateRequest] Error:", error);
    return {
      success: false as const,
      message: getErrorMessage(error, "Failed to submit certificate request"),
    };
  }
}
