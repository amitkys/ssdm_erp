"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  AdmittedStudentTable,
  EnrolledStudentTable,
  subjectTable,
} from "@/lib/db/schema";
import {
  type EnrollStudentInput,
  enrollStudentSchema,
} from "./zod-type/enroll-student";

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

export async function fetchActiveSubjects() {
  try {
    const subjects = await db.query.subjectTable.findMany({
      where: eq(subjectTable.isActive, true),
      orderBy: (subjects, { asc }) => [asc(subjects.name)],
    });

    return {
      success: true,
      subjects: subjects.map((s) => ({ id: s.id, name: s.name, code: s.code })),
    };
  } catch (error) {
    console.error("[fetchActiveSubjects] Error:", error);
    return { success: false, message: "Failed to fetch subjects" };
  }
}

export async function insertEnrolledStudent(input: EnrollStudentInput) {
  try {
    const session = await getAdminSession();
    if (!session.success) {
      return session;
    }

    const parsed = enrollStudentSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, message: "Invalid form details" };
    }

    const {
      UAN,
      registrationNumber,
      name,
      gender,
      reservation,
      admissionType,
      batchId,
      subMJC,
      ABCID,
      caste,
      email,
      phone,
    } = parsed.data;

    // Transform and clean optional fields
    const cleanRegNo = registrationNumber.trim() || null;

    const cleanABCID = ABCID && ABCID.trim() !== "" ? ABCID.trim() : null;

    let cleanCaste: "GEN" | "BC" | "EBC" | "SC" | "ST" | "OTHER" | null = null;
    if (caste && caste !== "") {
      const validCastes = ["GEN", "BC", "EBC", "SC", "ST", "OTHER"];
      if (validCastes.includes(caste)) {
        cleanCaste = caste as "GEN" | "BC" | "EBC" | "SC" | "ST" | "OTHER";
      } else {
        return { success: false, message: "Invalid Caste value selected." };
      }
    }

    let cleanEmail: string | null = null;
    if (email && email.trim() !== "") {
      const trimmedEmail = email.trim().toLowerCase();
      // Simple regex check for email format validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        return { success: false, message: "Invalid email format." };
      }
      cleanEmail = trimmedEmail;
    }

    let cleanPhone: string | null = null;
    if (phone && phone.trim() !== "") {
      const digits = phone.replace(/\D/g, "");
      if (digits.length !== 10) {
        return {
          success: false,
          message: "Phone number must be exactly 10 digits.",
        };
      }
      cleanPhone = digits;
    }

    // 1. Check if UAN already exists in either EnrolledStudentTable or AdmittedStudentTable
    const uanInEnrolled = await db.query.EnrolledStudentTable.findFirst({
      where: eq(EnrolledStudentTable.UAN, UAN),
    });
    const uanInAdmitted = await db.query.AdmittedStudentTable.findFirst({
      where: eq(AdmittedStudentTable.UAN, UAN),
    });
    if (uanInEnrolled || uanInAdmitted) {
      return {
        success: false,
        message: `UAN/Form Number "${UAN}" is already in use by another student.`,
      };
    }

    // 2. Check if Registration Number already exists (if provided)
    if (cleanRegNo) {
      const regInEnrolled = await db.query.EnrolledStudentTable.findFirst({
        where: eq(EnrolledStudentTable.registrationNumber, cleanRegNo),
      });
      const regInAdmitted = await db.query.AdmittedStudentTable.findFirst({
        where: eq(AdmittedStudentTable.registrationNumber, cleanRegNo),
      });
      if (regInEnrolled || regInAdmitted) {
        return {
          success: false,
          message: `Registration Number "${cleanRegNo}" is already in use.`,
        };
      }
    }

    // 3. Check if ABC ID already exists (if provided)
    if (cleanABCID) {
      const abcInEnrolled = await db.query.EnrolledStudentTable.findFirst({
        where: eq(EnrolledStudentTable.ABCID, cleanABCID),
      });
      const abcInAdmitted = await db.query.AdmittedStudentTable.findFirst({
        where: eq(AdmittedStudentTable.ABCID, cleanABCID),
      });
      if (abcInEnrolled || abcInAdmitted) {
        return {
          success: false,
          message: `ABC ID "${cleanABCID}" is already in use.`,
        };
      }
    }

    // 4. Check if Email already exists (if provided)
    if (cleanEmail) {
      const emailInEnrolled = await db.query.EnrolledStudentTable.findFirst({
        where: eq(EnrolledStudentTable.email, cleanEmail),
      });
      const emailInAdmitted = await db.query.AdmittedStudentTable.findFirst({
        where: eq(AdmittedStudentTable.email, cleanEmail),
      });
      if (emailInEnrolled || emailInAdmitted) {
        return {
          success: false,
          message: `Email Address "${cleanEmail}" is already in use.`,
        };
      }
    }

    // 5. Insert Enrolled Student
    const [inserted] = await db
      .insert(EnrolledStudentTable)
      .values({
        UAN,
        registrationNumber: cleanRegNo,
        name,
        gender,
        reservation,
        admissionType,
        batchId,
        subMJC,
        ABCID: cleanABCID,
        caste: cleanCaste,
        email: cleanEmail,
        phone: cleanPhone,
        // Default rest as null / empty as required
        subMIC: [],
        subMDC: [],
        subAEC: [],
        subSEC: [],
        subVAC: [],
        isSubmitted: false,
        isFeePaid: false,
        aadharNumber: null,
        universityRoll: null,
        fathersName: null,
        mothersName: null,
        DOB: null,
      })
      .returning();

    return { success: true, data: inserted };
  } catch (error) {
    console.error("[insertEnrolledStudent] Error:", error);

    // Handle unique constraint violations gracefully
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "23505"
    ) {
      return {
        success: false,
        message:
          "Unique constraint violation: A student with some of these details already exists.",
      };
    }

    return {
      success: false,
      message:
        "An error occurred while enrolling the student. Please try again.",
    };
  }
}
