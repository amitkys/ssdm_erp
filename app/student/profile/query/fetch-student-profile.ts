"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdmittedStudentTable } from "@/lib/db/schema";
import type { StudentProfile } from "../lib/types";

export async function fetchStudentProfile(): Promise<{
  success: boolean;
  message: string;
  data: StudentProfile | null;
}> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || session.user.role !== "student") {
      return { success: false, message: "Unauthorized", data: null };
    }

    const email = session.user.email;

    // Find by email first
    let student = await db.query.AdmittedStudentTable.findFirst({
      where: eq(AdmittedStudentTable.email, email),
      with: {
        batch: {
          with: {
            course: { with: { department: true } },
            academicSession: true,
          },
        },
        previousAcademicRecord: true,
        documents: true,
      },
    });

    // Fallback: extract UAN from student email format
    if (!student && email.endsWith("@student.ssdm.local")) {
      const uan = email.split("@")[0].toUpperCase();
      student = await db.query.AdmittedStudentTable.findFirst({
        where: eq(AdmittedStudentTable.UAN, uan),
        with: {
          batch: {
            with: {
              course: { with: { department: true } },
              academicSession: true,
            },
          },
          previousAcademicRecord: true,
          documents: true,
        },
      });
    }

    if (!student) {
      return {
        success: false,
        message: "Student profile not found",
        data: null,
      };
    }

    return {
      success: true,
      message: "Profile fetched successfully",
      data: student as StudentProfile,
    };
  } catch (error) {
    console.error("Error fetching student profile:", error);
    return { success: false, message: "Failed to fetch profile", data: null };
  }
}
