"use server";

import { and, eq, exists, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  academicSessionTable,
  batchTable,
} from "@/lib/db/schema/department";
import {
  AdmittedStudentTable,
  StudentFeePaymentTable,
} from "@/lib/db/schema/student";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

async function getAdminSession() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return { success: false as const, message: "Unauthorized" };
  }

  if (session.user.role !== "admin" && session.user.role !== "superAdmin") {
    return { success: false as const, message: "Forbidden" };
  }

  return { success: true as const, data: session };
}

export async function getAdmissionOverviewFilterOptions() {
  try {
    const session = await getAdminSession();
    if (!session.success) {
      return session;
    }

    const sessions = await db.query.academicSessionTable.findMany({
      orderBy: (s, { desc }) => [desc(s.createdAt)],
    });

    return { success: true, data: { sessions } };
  } catch (error) {
    console.error("[getAdmissionOverviewFilterOptions] Error:", error);
    return {
      success: false,
      message: getErrorMessage(error, "Failed to fetch filter options"),
    };
  }
}

export async function getAdmissionOverviewStats(
  sessionId: string,
  semesterCount: number,
) {
  try {
    const session = await getAdminSession();
    if (!session.success) {
      return session;
    }

    if (!sessionId || !semesterCount) {
      return {
        success: false,
        message: "Session ID and Semester Count are required",
      };
    }

    // Get all batch IDs that belong to this academic session
    const matchingBatches = await db
      .select({ id: batchTable.id })
      .from(batchTable)
      .where(eq(batchTable.academicSessionId, sessionId));

    const batchIds = matchingBatches.map((b) => b.id);

    if (batchIds.length === 0) {
      return {
        success: true,
        data: {
          successfulAdmissions: 0,
          pendingAdmissions: 0,
          totalFeeCollected: 0,
        },
      };
    }

    // Students in this session whose currentSemesterCount == selected semester
    const batchIdList = batchIds.map((id) => `'${id}'`).join(",");
    const studentFilter = and(
      sql`${AdmittedStudentTable.batchId} IN (${sql.raw(batchIdList)})`,
      eq(AdmittedStudentTable.currentSemesterCount, semesterCount),
      eq(AdmittedStudentTable.isActive, true),
    );

    // Subquery: student has a successful fee payment for this semester
    const hasSuccessPayment = exists(
      db
        .select({ one: sql`1` })
        .from(StudentFeePaymentTable)
        .where(
          and(
            eq(StudentFeePaymentTable.studentId, AdmittedStudentTable.id),
            eq(StudentFeePaymentTable.semesterCount, semesterCount),
            eq(StudentFeePaymentTable.status, "Success"),
          ),
        ),
    );

    // 1. Successful admissions — students who paid
    const [{ count: successfulAdmissions }] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(AdmittedStudentTable)
      .where(and(studentFilter, hasSuccessPayment));

    // 2. Total students in this session + semester
    const [{ count: totalStudents }] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(AdmittedStudentTable)
      .where(studentFilter);

    // 3. Pending admissions = total - successful
    const pendingAdmissions = totalStudents - successfulAdmissions;

    // 4. Total fee collected for this semester from students in matching batches
    const [{ sum: totalFeeCollected }] = await db
      .select({
        sum: sql`COALESCE(sum(${StudentFeePaymentTable.amount}), 0)`.mapWith(
          Number,
        ),
      })
      .from(StudentFeePaymentTable)
      .innerJoin(
        AdmittedStudentTable,
        eq(StudentFeePaymentTable.studentId, AdmittedStudentTable.id),
      )
      .where(
        and(
          sql`${AdmittedStudentTable.batchId} IN (${sql.raw(batchIdList)})`,
          eq(AdmittedStudentTable.currentSemesterCount, semesterCount),
          eq(AdmittedStudentTable.isActive, true),
          eq(StudentFeePaymentTable.semesterCount, semesterCount),
          eq(StudentFeePaymentTable.status, "Success"),
        ),
      );

    return {
      success: true,
      data: {
        successfulAdmissions,
        pendingAdmissions,
        totalFeeCollected: totalFeeCollected || 0,
      },
    };
  } catch (error) {
    console.error("[getAdmissionOverviewStats] Error:", error);
    return {
      success: false,
      message: getErrorMessage(error, "Failed to fetch admission overview stats"),
    };
  }
}
