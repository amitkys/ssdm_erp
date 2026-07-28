"use server";

import { and, eq, ilike, inArray, isNotNull, or } from "drizzle-orm";
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
      with: {
        student: {
          with: {
            batch: {
              with: {
                academicSession: true,
              },
            },
          },
        },
      },
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

    // Generate certificate_No if not already generated
    let certNo = existing.certificate_No;
    if (!certNo) {
      const certType = existing.certificate_type || "CLC";
      const targetTypes =
        certType === "CLC" || certType === "CHARACTER"
          ? ["CLC", "CHARACTER"]
          : ["BONAFIDE"];

      const lastApproved = await db.query.CertificateRequestTable.findFirst({
        where: and(
          eq(CertificateRequestTable.status, "APPROVED"),
          inArray(CertificateRequestTable.certificate_type, targetTypes),
          isNotNull(CertificateRequestTable.certificate_No),
        ),
        orderBy: (table, { desc }) => [
          desc(table.updatedAt),
          desc(table.createdAt),
        ],
      });

      // Derive 4-digit session code from student's academicSession name (e.g. "2026-2030" -> "2630")
      const sessionName = (existing as any).student?.batch?.academicSession?.name;
      let sessionCode = "";
      if (sessionName && sessionName.includes("-")) {
        const parts = sessionName.split("-").map((s: string) => s.trim());
        if (parts.length >= 2) {
          sessionCode = `${parts[0].slice(-2)}${parts[1].slice(-2)}`;
        }
      }

      if (!sessionCode) {
        const curr = new Date().getFullYear();
        sessionCode = `${String(curr).slice(-2)}${String(curr + 4).slice(-2)}`;
      }

      let lastSerial = 0;
      if (lastApproved?.certificate_No) {
        const parts = lastApproved.certificate_No.split("/");
        const lastPart = parts[parts.length - 1]; // e.g. "26300001"
        if (lastPart.startsWith(sessionCode)) {
          const serialStr = lastPart.slice(sessionCode.length);
          const parsed = parseInt(serialStr, 10);
          if (!isNaN(parsed)) {
            lastSerial = parsed;
          }
        }
      }

      let nextSerialNum = lastSerial + 1;
      const codePrefix = certType === "BONAFIDE" ? "SSDMBON" : "SSDMCLC";

      // Loop to guarantee unique certificate_No
      let candidateCertNo = "";
      let isUnique = false;
      let attempts = 0;

      while (!isUnique && attempts < 50) {
        const formattedSerial = nextSerialNum.toString().padStart(4, "0");
        candidateCertNo = `${codePrefix}/${sessionCode}${formattedSerial}`;

        const existingCertNo = await db.query.CertificateRequestTable.findFirst({
          where: eq(CertificateRequestTable.certificate_No, candidateCertNo),
        });

        if (!existingCertNo) {
          isUnique = true;
        } else {
          nextSerialNum++;
          attempts++;
        }
      }

      certNo = candidateCertNo;
    }

    await db
      .update(CertificateRequestTable)
      .set({
        status: "APPROVED",
        division: division.trim(),
        behaviour: behaviour.trim(),
        certificate_No: certNo,
        updatedAt: new Date(),
      })
      .where(eq(CertificateRequestTable.id, requestId));

    return { success: true, certificate_No: certNo };
  } catch (error) {
    console.error("[approveCertificateRequest] Error:", error);
    return {
      success: false,
      message: "Something went wrong while approving request.",
    };
  }
}
