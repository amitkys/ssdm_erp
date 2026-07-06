"use server";

import { and, desc, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  academicSessionTable,
  semesterAdmissionOpenTable,
  batchTable,
  AdmittedStudentTable,
  StudentFeePaymentTable,
} from "@/lib/db/schema";
import {
  type AddSemesterAdmissionOpenSchema,
  addSemesterAdmissionOpenSchema,
  type UpdateSemesterAdmissionOpenSchema,
  updateSemesterAdmissionOpenSchema,
} from "./zod-type/semester-admission-open-type";

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

export async function getSemesterAdmissionOpens() {
  try {
    const session = await getAdminSession();
    if (!session.success) {
      return session;
    }

    const rawRecords = await db.query.semesterAdmissionOpenTable.findMany({
      orderBy: [
        desc(semesterAdmissionOpenTable.updatedAt),
        desc(semesterAdmissionOpenTable.createdAt),
      ],
      with: { academicSession: true },
    });

    const data = [];

    for (const record of rawRecords) {
      let totalStudents = 0;
      let paidStudents = 0;
      let studentList: Array<{
        id: string;
        name: string;
        collegeRoll: string;
        paid: boolean;
        transactionId?: string;
        paidAt?: string;
      }> = [];

      // Find all batches for this academic session
      const batches = await db
        .select({ id: batchTable.id })
        .from(batchTable)
        .where(eq(batchTable.academicSessionId, record.academicSessionId));

      const batchIds = batches.map((b) => b.id);

      if (batchIds.length > 0) {
        // Get all active admitted students in these batches
        const students = await db.query.AdmittedStudentTable.findMany({
          where: and(
            inArray(AdmittedStudentTable.batchId, batchIds),
            eq(AdmittedStudentTable.isActive, true),
            eq(AdmittedStudentTable.isPassed, false),
          ),
          columns: { id: true, name: true, collegeRoll: true },
        });

        totalStudents = students.length;

        if (students.length > 0) {
          const studentIds = students.map((s) => s.id);

          // Find successful fee payments for these students and the target semester
          const payments = await db.query.StudentFeePaymentTable.findMany({
            where: and(
              inArray(StudentFeePaymentTable.studentId, studentIds),
              eq(StudentFeePaymentTable.semesterCount, record.semesterCount),
              eq(StudentFeePaymentTable.status, "Success"),
            ),
          });

          const paidStudentIds = new Set(payments.map((p) => p.studentId));
          paidStudents = paidStudentIds.size;

          studentList = students.map((s) => {
            const payment = payments.find((p) => p.studentId === s.id);
            return {
              id: s.id,
              name: s.name,
              collegeRoll: s.collegeRoll,
              paid: paidStudentIds.has(s.id),
              transactionId: payment?.transactionId,
              paidAt: payment?.createdAt
                ? new Date(payment.createdAt).toLocaleDateString("en-IN")
                : undefined,
            };
          });
        }
      }

      data.push({ ...record, totalStudents, paidStudents, studentList });
    }

    return { success: true, data };
  } catch (error) {
    console.error("[getSemesterAdmissionOpens] Error:", error);
    return {
      success: false,
      message:
        "Something went wrong while fetching semester admission records.",
    };
  }
}

export async function addSemesterAdmissionOpen(
  input: AddSemesterAdmissionOpenSchema,
) {
  try {
    const session = await getAdminSession();
    if (!session.success) {
      return session;
    }

    const parsedInput = addSemesterAdmissionOpenSchema.safeParse(input);
    if (!parsedInput.success) {
      return { success: false, message: "Invalid semester admission details" };
    }

    const [record] = await db
      .insert(semesterAdmissionOpenTable)
      .values({
        academicSessionId: parsedInput.data.academicSessionId,
        semesterCount: parsedInput.data.semesterCount,
        practicalFee: parsedInput.data.practicalFee ?? null,
        startDate: parsedInput.data.startDate,
        endDate: parsedInput.data.endDate,
        lateFee: parsedInput.data.lateFee,
      })
      .returning();

    revalidatePath("/");
    revalidatePath("/student/dashboard");
    return { success: true, data: record };
  } catch (error) {
    console.error("[addSemesterAdmissionOpen] Error:", error);
    return {
      success: false,
      message: "Something went wrong while adding semester admission record.",
    };
  }
}

export async function updateSemesterAdmissionOpen(
  input: UpdateSemesterAdmissionOpenSchema,
) {
  try {
    const session = await getAdminSession();
    if (!session.success) {
      return session;
    }

    const parsedInput = updateSemesterAdmissionOpenSchema.safeParse(input);
    if (!parsedInput.success) {
      return { success: false, message: "Invalid semester admission details" };
    }

    const {
      id,
      academicSessionId,
      semesterCount,
      practicalFee,
      startDate,
      endDate,
      lateFee,
    } = parsedInput.data;

    const [record] = await db
      .update(semesterAdmissionOpenTable)
      .set({
        academicSessionId,
        semesterCount,
        practicalFee: practicalFee ?? null,
        startDate,
        endDate,
        lateFee,
        updatedAt: new Date(),
      })
      .where(eq(semesterAdmissionOpenTable.id, id))
      .returning();

    if (!record) {
      return { success: false, message: "Semester admission record not found" };
    }

    revalidatePath("/");
    revalidatePath("/student/dashboard");
    return { success: true, data: record };
  } catch (error) {
    console.error("[updateSemesterAdmissionOpen] Error:", error);
    return {
      success: false,
      message: "Something went wrong while updating semester admission record.",
    };
  }
}

export async function deleteSemesterAdmissionOpen(id: string) {
  try {
    const session = await getAdminSession();
    if (!session.success) {
      return session;
    }

    const [record] = await db
      .delete(semesterAdmissionOpenTable)
      .where(eq(semesterAdmissionOpenTable.id, id))
      .returning();

    if (!record) {
      return { success: false, message: "Semester admission record not found" };
    }

    revalidatePath("/");
    revalidatePath("/student/dashboard");
    return { success: true, data: record };
  } catch (error) {
    console.error("[deleteSemesterAdmissionOpen] Error:", error);
    return {
      success: false,
      message: "Something went wrong while deleting semester admission record.",
    };
  }
}

export async function getAcademicSessions() {
  try {
    const session = await getAdminSession();
    if (!session.success) {
      return session;
    }

    const sessions = await db.query.academicSessionTable.findMany({
      orderBy: [desc(academicSessionTable.createdAt)],
    });

    return { success: true, data: sessions };
  } catch (error) {
    console.error("[getAcademicSessions] Error:", error);
    return {
      success: false,
      message: "Something went wrong while fetching academic sessions.",
    };
  }
}
