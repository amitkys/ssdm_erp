"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdmittedStudentTable, batchTable } from "@/lib/db/schema";
import type { DashboardData } from "../lib/types";

export async function fetchDashboardData(): Promise<{
  success: boolean;
  message: string;
  data: DashboardData | null;
  email?: string;
}> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || session.user.role !== "student") {
      return { success: false, message: "Unauthorized", data: null };
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
      return {
        success: false,
        message: "Admitted profile not found",
        data: null,
        email,
      };
    }

    // Fetch batch details
    const batch = await db.query.batchTable.findFirst({
      where: eq(batchTable.id, student.batchId),
      with: { course: true, academicSession: true },
    });

    return {
      success: true,
      message: "Dashboard data fetched successfully",
      data: { student, batch: batch ? (batch as any) : null },
      email,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return { success: false, message: "Internal server error", data: null };
  }
}
