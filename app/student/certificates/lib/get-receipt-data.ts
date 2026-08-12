"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CertificateRequestTable } from "@/lib/db/schema/certificate";
import { AdmittedStudentTable } from "@/lib/db/schema/student";
import { getCollegeConfig } from "@/lib/college-config";

export async function getCertificateReceiptData(requestId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "student") {
      return { success: false as const, message: "Unauthorized" };
    }

    const email = session.user.email;

    // Find the student
    let student = await db.query.AdmittedStudentTable.findFirst({
      where: eq(AdmittedStudentTable.email, email),
      with: {
        batch: {
          with: {
            course: true,
            academicSession: true,
          },
        },
      },
    });

    // Fallback: UAN-based email format
    if (!student && email.endsWith("@student.ssdm.local")) {
      const uan = email.split("@")[0].toUpperCase();
      student = await db.query.AdmittedStudentTable.findFirst({
        where: eq(AdmittedStudentTable.UAN, uan),
        with: {
          batch: {
            with: {
              course: true,
              academicSession: true,
            },
          },
        },
      });
    }

    if (!student) {
      return { success: false as const, message: "Student record not found." };
    }

    // Fetch the certificate request
    const request = await db.query.CertificateRequestTable.findFirst({
      where: eq(CertificateRequestTable.id, requestId),
      with: { certificate: true },
    });

    if (!request) {
      return {
        success: false as const,
        message: "Certificate request not found.",
      };
    }

    // Verify the student owns this request
    if (request.studentId !== student.id) {
      return { success: false as const, message: "Unauthorized" };
    }

    // Only generate receipt if payment was successful
    if (request.paymentStatus !== "SUCCESS") {
      return {
        success: false as const,
        message: "Receipt is only available for successfully paid requests.",
      };
    }

    const college = getCollegeConfig();

    const batch = student.batch as {
      course: { name: string };
      academicSession: { name: string };
    };

    return {
      success: true as const,
      data: {
        // College info
        college: {
          name: college.name,
          address: college.address,
          city: college.city,
          state: college.state,
          pincode: college.pincode,
          email: college.email,
          phone: college.phone,
        },
        // Student info
        student: {
          name: student.name,
          collegeRoll: student.collegeRoll,
          batchWithSession: `${batch.course.name} (${batch.academicSession.name})`,
        },
        // Certificate info
        certificateType: request.certificate_type,
        certificateStatus: request.status,
        // Transaction info
        transactionId: request.transactionId || "N/A",
        amount: request.amount ?? request.certificate.fee,
        paymentMode: "Online",
        paymentDate: request.updatedAt.toISOString(),
        paymentStatus: request.paymentStatus,
      },
    };
  } catch (error) {
    console.error("[getCertificateReceiptData] Error:", error);
    return {
      success: false as const,
      message: "Something went wrong while fetching receipt data.",
    };
  }
}
