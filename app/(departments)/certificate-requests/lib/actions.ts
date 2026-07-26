"use server";

import { and, eq, ilike, inArray, or } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CertificateRequestTable } from "@/lib/db/schema/certificate";
import { AdmittedStudentTable } from "@/lib/db/schema/student";

async function verifyAdminAuth() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (
    !session ||
    (session.user.role !== "admin" && session.user.role !== "superAdmin")
  ) {
    return false;
  }
  return true;
}

export async function getAdminCertificateRequests(params?: {
  status?: string;
  collegeRoll?: string;
}) {
  try {
    const isAdmin = await verifyAdminAuth();
    if (!isAdmin) {
      return { success: false, message: "Unauthorized" };
    }

    const { status, collegeRoll } = params || {};

    // Filter statuses: only PENDING or APPROVED (never INITIATE)
    let statusConditions = ["PENDING", "APPROVED"];
    if (status && (status === "PENDING" || status === "APPROVED")) {
      statusConditions = [status];
    }

    let whereClause = inArray(CertificateRequestTable.status, statusConditions);

    const requests = await db.query.CertificateRequestTable.findMany({
      where: whereClause,
      with: {
        student: true,
        certificate: true,
      },
      orderBy: (table, { desc }) => [desc(table.createdAt)],
    });

    // If searching by college roll, filter in memory or via subquery
    let filtered = requests;
    if (collegeRoll && collegeRoll.trim() !== "") {
      const search = collegeRoll.trim().toLowerCase();
      filtered = requests.filter((r) =>
        r.student?.collegeRoll?.toLowerCase().includes(search),
      );
    }

    return { success: true, data: filtered };
  } catch (error) {
    console.error("[getAdminCertificateRequests] Error:", error);
    return {
      success: false,
      message: "Failed to fetch certificate requests.",
    };
  }
}

export async function approveCertificateRequest(params: {
  requestId: string;
  division: string;
  behaviour: string;
}) {
  try {
    const isAdmin = await verifyAdminAuth();
    if (!isAdmin) {
      return { success: false, message: "Unauthorized" };
    }

    const { requestId, division, behaviour } = params;

    if (!division.trim()) {
      return { success: false, message: "Division is required." };
    }

    if (!behaviour.trim()) {
      return { success: false, message: "Behaviour is required." };
    }

    const existing = await db.query.CertificateRequestTable.findFirst({
      where: eq(CertificateRequestTable.id, requestId),
    });

    if (!existing) {
      return { success: false, message: "Certificate request not found." };
    }

    if (existing.status !== "PENDING") {
      return {
        success: false,
        message: "Only requests with status PENDING can be approved.",
      };
    }

    await db
      .update(CertificateRequestTable)
      .set({
        status: "APPROVED",
        division: division.trim(),
        behaviour: behaviour.trim(),
        updatedAt: new Date(),
      })
      .where(eq(CertificateRequestTable.id, requestId));

    return { success: true };
  } catch (error) {
    console.error("[approveCertificateRequest] Error:", error);
    return {
      success: false,
      message: "Something went wrong while approving request.",
    };
  }
}
