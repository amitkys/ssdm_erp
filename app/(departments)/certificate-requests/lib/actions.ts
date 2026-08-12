"use server";

import { and, eq, ilike, inArray, isNotNull, or, sql } from "drizzle-orm";
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

      const codePrefix = certType === "BONAFIDE" ? "SSDMBON" : "SSDMCLC";

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

      const expectedPrefix = `${codePrefix}/`;

      // Retry loop to handle race conditions on the unique constraint.
      // If two concurrent approvals generate the same certificate_No,
      // the DB unique constraint will reject one. We catch that and retry
      // with a fresh max serial lookup inside the transaction.
      const MAX_RETRIES = 5;
      let lastError: unknown = null;

      for (let retry = 0; retry < MAX_RETRIES; retry++) {
        try {
          certNo = await db.transaction(async (tx) => {
            // Lock all rows of matching certificate types that have a certificate_No
            // using FOR UPDATE to prevent concurrent transactions from reading
            // the same max serial. This serialises certificate_No generation.
            const lockedRows = await tx.execute(
              sql`SELECT "certificate_No" FROM "certificate_request"
                  WHERE "certificate_type" IN (${sql.join(targetTypes.map(t => sql`${t}`), sql`, `)})
                    AND "certificate_No" IS NOT NULL
                  FOR UPDATE`
            );

            let maxSerial = 0;
            for (const row of lockedRows.rows as { certificate_No: string }[]) {
              const no = row.certificate_No;
              if (!no || !no.startsWith(expectedPrefix)) continue;
              const suffix = no.slice(expectedPrefix.length);
              if (!suffix.startsWith(sessionCode)) continue;
              const serialStr = suffix.slice(sessionCode.length);
              const parsed = parseInt(serialStr, 10);
              if (!isNaN(parsed) && parsed > maxSerial) {
                maxSerial = parsed;
              }
            }

            const nextSerialNum = maxSerial + 1;
            const formattedSerial = nextSerialNum.toString().padStart(4, "0");
            const candidateCertNo = `${codePrefix}/${sessionCode}${formattedSerial}`;

            await tx
              .update(CertificateRequestTable)
              .set({
                status: "APPROVED",
                division: division.trim(),
                behaviour: behaviour.trim(),
                certificate_No: candidateCertNo,
                updatedAt: new Date(),
              })
              .where(eq(CertificateRequestTable.id, requestId));

            return candidateCertNo;
          });

          // Transaction succeeded — break out of the retry loop
          lastError = null;
          break;
        } catch (err: any) {
          lastError = err;
          // Check if this is the unique constraint violation (PG error code 23505)
          const pgCode = err?.code ?? err?.cause?.code;
          if (pgCode === "23505") {
            // Retry with a fresh serial lookup
            console.warn(
              `[approveCertificateRequest] Unique constraint collision on retry ${retry + 1}, retrying...`
            );
            continue;
          }
          // For any other error, throw immediately
          throw err;
        }
      }

      if (lastError) {
        throw lastError;
      }
    } else {
      // certificate_No already exists, just update status/division/behaviour
      await db
        .update(CertificateRequestTable)
        .set({
          status: "APPROVED",
          division: division.trim(),
          behaviour: behaviour.trim(),
          updatedAt: new Date(),
        })
        .where(eq(CertificateRequestTable.id, requestId));
    }

    return { success: true, certificate_No: certNo };
  } catch (error) {
    console.error("[approveCertificateRequest] Error:", error);
    return {
      success: false,
      message: "Something went wrong while approving request.",
    };
  }
}
