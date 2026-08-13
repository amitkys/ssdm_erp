"use server";

import { and, desc, eq, gte, lte } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  academicSessionTable,
  AdmittedStudentTable,
  batchTable,
  CertificateMetaDataTable,
  CertificateRequestTable,
  courseTable,
  departmentTable,
} from "@/lib/db/schema";
import { headers } from "next/headers";

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

export async function getCertificateDCRStats() {
  try {
    const session = await getAdminSession();
    if (!session.success) {
      return session;
    }

    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0,
    );
    const endOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999,
    );

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0,
      0,
      0,
      0,
    );
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    // Today's successful certificate payments
    const todayResult = await db
      .select({ amount: CertificateRequestTable.amount })
      .from(CertificateRequestTable)
      .where(
        and(
          eq(CertificateRequestTable.paymentStatus, "SUCCESS"),
          gte(CertificateRequestTable.createdAt, startOfToday),
          lte(CertificateRequestTable.createdAt, endOfToday),
        ),
      );

    const todayAmount = todayResult.reduce(
      (sum, p) => sum + Number(p.amount || 0),
      0,
    );
    const todayCount = todayResult.length;

    // This Month's successful certificate payments
    const monthResult = await db
      .select({ amount: CertificateRequestTable.amount })
      .from(CertificateRequestTable)
      .where(
        and(
          eq(CertificateRequestTable.paymentStatus, "SUCCESS"),
          gte(CertificateRequestTable.createdAt, startOfMonth),
          lte(CertificateRequestTable.createdAt, endOfMonth),
        ),
      );

    const monthAmount = monthResult.reduce(
      (sum, p) => sum + Number(p.amount || 0),
      0,
    );
    const monthCount = monthResult.length;

    // Total overall successful certificate payments
    const totalResult = await db
      .select({ amount: CertificateRequestTable.amount })
      .from(CertificateRequestTable)
      .where(eq(CertificateRequestTable.paymentStatus, "SUCCESS"));

    const totalAmount = totalResult.reduce(
      (sum, p) => sum + Number(p.amount || 0),
      0,
    );
    const totalCount = totalResult.length;

    return {
      success: true,
      stats: {
        today: { amount: todayAmount, count: todayCount },
        month: { amount: monthAmount, count: monthCount },
        total: { amount: totalAmount, count: totalCount },
      },
    };
  } catch (error) {
    console.error("[getCertificateDCRStats] Error:", error);
    return {
      success: false,
      message: "Something went wrong while fetching certificate stats.",
    };
  }
}

export interface CertificateDCRFilters {
  startDate?: string;
  endDate?: string;
  certificateType?: string;
  departmentId?: string;
  courseId?: string;
  batchId?: string;
  paymentStatus?: string;
}

export async function getCertificateDCRReport(
  filters: CertificateDCRFilters = {},
) {
  try {
    const session = await getAdminSession();
    if (!session.success) {
      return session;
    }

    const {
      startDate,
      endDate,
      certificateType,
      departmentId,
      courseId,
      batchId,
      paymentStatus = "SUCCESS",
    } = filters;

    const conditions = [];

    // Filter by paymentStatus (defaulting to SUCCESS for collection tracking)
    if (paymentStatus && paymentStatus !== "all") {
      conditions.push(eq(CertificateRequestTable.paymentStatus, paymentStatus));
    }

    if (certificateType && certificateType !== "all") {
      conditions.push(
        eq(CertificateRequestTable.certificate_type, certificateType),
      );
    }

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      conditions.push(gte(CertificateRequestTable.createdAt, start));
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      conditions.push(lte(CertificateRequestTable.createdAt, end));
    }

    if (batchId && batchId !== "all") {
      conditions.push(eq(AdmittedStudentTable.batchId, batchId));
    }

    if (courseId && courseId !== "all") {
      conditions.push(eq(batchTable.courseId, courseId));
    }

    if (departmentId && departmentId !== "all") {
      conditions.push(eq(courseTable.departmentId, departmentId));
    }

    const report = await db
      .select({
        id: CertificateRequestTable.id,
        transactionId: CertificateRequestTable.transactionId,
        certificateNo: CertificateRequestTable.certificate_No,
        certificateType: CertificateRequestTable.certificate_type,
        amount: CertificateRequestTable.amount,
        status: CertificateRequestTable.status,
        paymentStatus: CertificateRequestTable.paymentStatus,
        purpose: CertificateRequestTable.purpose,
        createdAt: CertificateRequestTable.createdAt,
        studentName: AdmittedStudentTable.name,
        uan: AdmittedStudentTable.UAN,
        collegeRoll: AdmittedStudentTable.collegeRoll,
        courseName: courseTable.name,
        sessionName: academicSessionTable.name,
        metaFee: CertificateMetaDataTable.fee,
      })
      .from(CertificateRequestTable)
      .innerJoin(
        AdmittedStudentTable,
        eq(CertificateRequestTable.studentId, AdmittedStudentTable.id),
      )
      .leftJoin(
        CertificateMetaDataTable,
        eq(CertificateRequestTable.certificateId, CertificateMetaDataTable.id),
      )
      .innerJoin(batchTable, eq(AdmittedStudentTable.batchId, batchTable.id))
      .innerJoin(courseTable, eq(batchTable.courseId, courseTable.id))
      .innerJoin(
        academicSessionTable,
        eq(batchTable.academicSessionId, academicSessionTable.id),
      )
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(CertificateRequestTable.createdAt));

    return {
      success: true,
      report: report.map((r) => ({
        id: r.id,
        transactionId: r.transactionId || "N/A",
        certificateNo: r.certificateNo || "Pending Approval",
        certificateType: r.certificateType,
        amount: Number(r.amount ?? r.metaFee ?? 0),
        status: r.status,
        paymentStatus: r.paymentStatus || "PENDING",
        purpose: r.purpose,
        createdAt: r.createdAt.toISOString(),
        studentName: r.studentName,
        uan: r.uan,
        collegeRoll: r.collegeRoll,
        courseName: r.courseName,
        sessionName: r.sessionName,
      })),
    };
  } catch (error) {
    console.error("[getCertificateDCRReport] Error:", error);
    return {
      success: false,
      message:
        "Something went wrong while generating the Certificate DCR report.",
    };
  }
}

export async function getCertificateDCRFilterOptions() {
  try {
    const session = await getAdminSession();
    if (!session.success) {
      return session;
    }

    const departments = await db
      .select({ id: departmentTable.id, name: departmentTable.name })
      .from(departmentTable);

    const courses = await db
      .select({
        id: courseTable.id,
        name: courseTable.name,
        departmentId: courseTable.departmentId,
      })
      .from(courseTable);

    const batches = await db
      .select({
        id: batchTable.id,
        courseId: batchTable.courseId,
        courseName: courseTable.name,
        sessionName: academicSessionTable.name,
      })
      .from(batchTable)
      .innerJoin(courseTable, eq(batchTable.courseId, courseTable.id))
      .innerJoin(
        academicSessionTable,
        eq(batchTable.academicSessionId, academicSessionTable.id),
      );

    const certificateMeta = await db
      .select({
        id: CertificateMetaDataTable.id,
        certificateType: CertificateMetaDataTable.certificate_type,
        fee: CertificateMetaDataTable.fee,
      })
      .from(CertificateMetaDataTable);

    const defaultTypes = ["CLC", "CHARACTER", "BONAFIDE", "TEST"];
    const metaTypes = certificateMeta.map((m) => m.certificateType);
    const certificateTypes = Array.from(
      new Set([...defaultTypes, ...metaTypes]),
    );

    return {
      success: true,
      departments,
      courses,
      batches: batches.map((b) => ({
        id: b.id,
        courseId: b.courseId,
        name: `${b.courseName} (Session: ${b.sessionName})`,
      })),
      certificateTypes,
    };
  } catch (error) {
    console.error("[getCertificateDCRFilterOptions] Error:", error);
    return {
      success: false,
      message: "Something went wrong while fetching filter options.",
    };
  }
}
