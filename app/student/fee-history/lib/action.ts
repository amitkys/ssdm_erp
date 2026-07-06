"use server";

import { and, eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  AdmittedStudentTable,
  admissionOpenTable,
  batchTable,
  StudentFeePaymentTable,
  semesterAdmissionOpenTable,
  subjectTable,
} from "@/lib/db/schema";

export async function getStudentFeeData() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || session.user.role !== "student") {
      return { success: false as const, message: "Unauthorized" };
    }

    const email = session.user.email;

    // Find admitted student record matching authenticated email
    let student = await db.query.AdmittedStudentTable.findFirst({
      where: eq(AdmittedStudentTable.email, email),
    });

    // If not found and using student UAN email format, extract UAN and search
    if (!student && email.endsWith("@student.ssdm.local")) {
      const uan = email.split("@")[0].toUpperCase();
      student = await db.query.AdmittedStudentTable.findFirst({
        where: eq(AdmittedStudentTable.UAN, uan),
      });
    }

    if (!student) {
      return { success: false as const, message: "Student profile not found" };
    }

    // Fetch batch details
    const batch = await db.query.batchTable.findFirst({
      where: eq(batchTable.id, student.batchId),
      with: { course: true, academicSession: true },
    });

    // Look up fee payment status for studentId and currentSemesterCount
    const payment = await db.query.StudentFeePaymentTable.findFirst({
      where: and(
        eq(StudentFeePaymentTable.studentId, student.id),
        eq(StudentFeePaymentTable.semesterCount, student.currentSemesterCount),
        eq(StudentFeePaymentTable.status, "Success"),
      ),
    });

    const hasPaid = !!payment;

    // Query all successful payment records for the student
    const allPayments = await db.query.StudentFeePaymentTable.findMany({
      where: and(
        eq(StudentFeePaymentTable.studentId, student.id),
        eq(StudentFeePaymentTable.status, "Success"),
      ),
      orderBy: (table, { desc }) => [
        desc(table.semesterCount),
        desc(table.createdAt),
      ],
    });

    // Check if next semester count exists in semester_admission_open
    const nextSemesterCount = student.currentSemesterCount + 1;
    const nextSemesterPaid = await db.query.StudentFeePaymentTable.findFirst({
      where: and(
        eq(StudentFeePaymentTable.studentId, student.id),
        eq(StudentFeePaymentTable.semesterCount, nextSemesterCount),
        eq(StudentFeePaymentTable.status, "Success"),
      ),
    });

    const nextSemesterAdmission =
      nextSemesterPaid || !batch || student.isPassed
        ? null
        : await db.query.semesterAdmissionOpenTable.findFirst({
            where: and(
              eq(
                semesterAdmissionOpenTable.academicSessionId,
                batch.academicSessionId,
              ),
              eq(semesterAdmissionOpenTable.semesterCount, nextSemesterCount),
            ),
          });

    // Check if current semester admission window is open
    let isCurrentSemesterAdmissionOpen = false;
    if (batch) {
      if (student.currentSemesterCount === 1) {
        const admissionOpen = await db.query.admissionOpenTable.findFirst({
          where: eq(admissionOpenTable.batchId, student.batchId),
        });
        if (admissionOpen) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const start = new Date(admissionOpen.startDate);
          const end = new Date(admissionOpen.endDate);
          isCurrentSemesterAdmissionOpen = today >= start && today <= end;
        }
      } else {
        const semesterAdmission =
          await db.query.semesterAdmissionOpenTable.findFirst({
            where: and(
              eq(
                semesterAdmissionOpenTable.academicSessionId,
                batch.academicSessionId,
              ),
              eq(
                semesterAdmissionOpenTable.semesterCount,
                student.currentSemesterCount,
              ),
            ),
          });
        if (semesterAdmission) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const start = new Date(semesterAdmission.startDate);
          const end = new Date(semesterAdmission.endDate);
          isCurrentSemesterAdmissionOpen = today >= start && today <= end;
        }
      }
    }

    let nextSemesterFees = null;
    let pendingNextSemesterPayment = null;

    if (nextSemesterAdmission && batch) {
      const allSubjectIds = [
        student.subMJC,
        ...(student.subMIC || []),
        ...(student.subMDC || []),
        ...(student.subAEC || []),
        ...(student.subSEC || []),
        ...(student.subVAC || []),
      ].filter(Boolean) as string[];

      let hasPractical = false;
      if (allSubjectIds.length > 0) {
        const subjects = await db
          .select({ hasPractical: subjectTable.hasPractical })
          .from(subjectTable)
          .where(inArray(subjectTable.id, allSubjectIds));
        hasPractical = subjects.some((s) => s.hasPractical === true);
      }

      const admissionOpen = await db.query.admissionOpenTable.findFirst({
        where: eq(admissionOpenTable.batchId, student.batchId),
      });

      const tuitionFee = batch.perSemesterFee;
      const practicalFee = hasPractical
        ? (admissionOpen?.practicalFee ?? 500)
        : 0;

      let lateFee = 0;
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      const [endYear, endMonth, endDay] = nextSemesterAdmission.endDate
        .split("-")
        .map(Number);
      const standardEndDate = new Date(endYear, endMonth - 1, endDay);
      if (currentDate > standardEndDate) {
        lateFee = nextSemesterAdmission.lateFee ?? 0;
      }

      nextSemesterFees = {
        tuitionFee,
        practicalFee,
        lateFee,
        totalAmount: tuitionFee + practicalFee + lateFee,
      };

      pendingNextSemesterPayment =
        await db.query.StudentFeePaymentTable.findFirst({
          where: and(
            eq(StudentFeePaymentTable.studentId, student.id),
            eq(StudentFeePaymentTable.semesterCount, nextSemesterCount),
            eq(StudentFeePaymentTable.status, "Pending"),
          ),
          orderBy: (table, { desc }) => [desc(table.createdAt)],
        });
    }

    return {
      success: true as const,
      data: {
        student,
        batch,
        hasPaid,
        payment: payment
          ? {
              id: payment.id,
              amount: payment.amount,
              paymentMode: payment.paymentMode,
              transactionId: payment.transactionId,
            }
          : null,
        allPayments: allPayments.map((p) => ({
          id: p.id,
          semesterCount: p.semesterCount,
          amount: p.amount,
          paymentMode: p.paymentMode,
          transactionId: p.transactionId,
          createdAt: p.createdAt.toISOString(),
        })),
        isCurrentSemesterAdmissionOpen,
        nextSemesterAdmission: nextSemesterAdmission
          ? {
              startDate: nextSemesterAdmission.startDate,
              endDate: nextSemesterAdmission.endDate,
              lateFee: nextSemesterAdmission.lateFee,
            }
          : null,
        nextSemesterFees,
        pendingNextSemesterPayment: pendingNextSemesterPayment
          ? { createdAt: pendingNextSemesterPayment.createdAt.toISOString() }
          : null,
        nextSemesterCount,
      },
    };
  } catch (error) {
    console.error("Failed to fetch student fee data:", error);
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Internal server error",
    };
  }
}
