"use server";

import { asc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { batchTable, courseTable, semesterTable } from "@/lib/db/schema";

async function getAdminSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { success: false as const, message: "Unauthorized" };
  if (session.user.role !== "admin" && session.user.role !== "superAdmin") {
    return { success: false as const, message: "Forbidden" };
  }
  return { success: true as const, data: session };
}

// Fetch all batches for a course, with session + semesters + subjects + fees
export async function fetchBatchesByCourse(courseId: string) {
  try {
    const session = await getAdminSession();
    if (!session.success) return session;

    const course = await db.query.courseTable.findFirst({
      where: eq(courseTable.id, courseId),
      with: {
        department: true,
        batches: {
          with: {
            session: true,
            semesters: {
              orderBy: [asc(semesterTable.semesterNumber)],
              with: {
                semesterSubjects: {
                  with: { subject: true },
                },
                fees: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      return { success: false as const, message: "Course not found" };
    }

    return { success: true as const, data: course };
  } catch (error) {
    return {
      success: false as const,
      message:
        error instanceof Error ? error.message : "Error fetching batches",
    };
  }
}

// Keep old action for backward compat (semester route still uses it)
export async function fetchSemestersByBatch(batchId: string) {
  try {
    const session = await getAdminSession();
    if (!session.success) return session;

    const semesters = await db.query.semesterTable.findMany({
      where: eq(semesterTable.batchId, batchId),
      orderBy: [asc(semesterTable.semesterNumber)],
      with: {
        semesterSubjects: { with: { subject: true } },
        fees: true,
      },
    });

    return { success: true as const, data: semesters };
  } catch (error) {
    return {
      success: false as const,
      message:
        error instanceof Error ? error.message : "Error fetching semesters",
    };
  }
}