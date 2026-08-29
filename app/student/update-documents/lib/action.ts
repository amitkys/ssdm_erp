"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  AdmittedStudentTable,
  StudentDocumentsTable,
} from "@/lib/db/schema";

// ─── GET CURRENT DOCUMENT URLs ──────────────────────────────────────────────────

export async function getStudentDocumentUrls(): Promise<{
  success: boolean;
  message: string;
  data: { studentId: string; photo: string | null; signature: string | null } | null;
}> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || session.user.role !== "student") {
      return { success: false, message: "Unauthorized", data: null };
    }

    const email = session.user.email;

    // Find student by email
    let student = await db.query.AdmittedStudentTable.findFirst({
      where: eq(AdmittedStudentTable.email, email),
      columns: { id: true },
      with: { documents: { columns: { photo: true, signature: true } } },
    });

    // Fallback: extract UAN from student email format
    if (!student && email.endsWith("@student.ssdm.local")) {
      const uan = email.split("@")[0].toUpperCase();
      student = await db.query.AdmittedStudentTable.findFirst({
        where: eq(AdmittedStudentTable.UAN, uan),
        columns: { id: true },
        with: { documents: { columns: { photo: true, signature: true } } },
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
      message: "Document URLs fetched successfully",
      data: {
        studentId: student.id,
        photo: student.documents?.photo ?? null,
        signature: student.documents?.signature ?? null,
      },
    };
  } catch (error) {
    console.error("Error fetching document URLs:", error);
    return { success: false, message: "Failed to fetch document URLs", data: null };
  }
}

// ─── UPDATE STUDENT DOCUMENT ────────────────────────────────────────────────────

export async function updateStudentDocument(input: {
  type: "photo" | "signature";
  newUrl: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || session.user.role !== "student") {
      return { success: false, message: "Unauthorized" };
    }

    const email = session.user.email;

    // Find student
    let student = await db.query.AdmittedStudentTable.findFirst({
      where: eq(AdmittedStudentTable.email, email),
      columns: { id: true },
      with: { documents: { columns: { id: true } } },
    });

    if (!student && email.endsWith("@student.ssdm.local")) {
      const uan = email.split("@")[0].toUpperCase();
      student = await db.query.AdmittedStudentTable.findFirst({
        where: eq(AdmittedStudentTable.UAN, uan),
        columns: { id: true },
        with: { documents: { columns: { id: true } } },
      });
    }

    if (!student) {
      return { success: false, message: "Student profile not found" };
    }

    if (!student.documents) {
      return { success: false, message: "No document record found for this student" };
    }

    // Update the document URL in student_documents table
    await db
      .update(StudentDocumentsTable)
      .set({
        [input.type]: input.newUrl,
        updatedAt: new Date(),
      })
      .where(eq(StudentDocumentsTable.id, student.documents.id));

    // If updating photo, also update avatar in admitted_students table
    if (input.type === "photo") {
      await db
        .update(AdmittedStudentTable)
        .set({ avatar: input.newUrl })
        .where(eq(AdmittedStudentTable.id, student.id));
    }

    revalidatePath("/student/profile");
    revalidatePath("/student/update-documents");

    return {
      success: true,
      message: `${input.type === "photo" ? "Photo" : "Signature"} updated successfully`,
    };
  } catch (error) {
    console.error("Error updating student document:", error);
    return { success: false, message: "Failed to update document" };
  }
}
