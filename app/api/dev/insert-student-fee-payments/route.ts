import { createId } from "@paralleldrive/cuid2";
import { inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import * as z from "zod";
import { db } from "@/lib/db";
import { AdmittedStudentTable, StudentFeePaymentTable } from "@/lib/db/schema";

const dateTransform = z
  .any()
  .optional()
  .nullable()
  .transform((val) => {
    if (!val || String(val).trim() === "") {
      return undefined;
    }
    try {
      const d = new Date(val);
      return isNaN(d.getTime()) ? undefined : d;
    } catch {
      return undefined;
    }
  });

const studentFeePaymentItemSchema = z.object({
  id: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val || createId()),
  studentId: z.string().min(1, "Student ID is required"),
  semesterCount: z
    .number()
    .int()
    .min(1, "semesterCount must be a positive integer"),
  amount: z.number().nonnegative("amount must be a non-negative number"),
  paymentMode: z.string().min(1, "paymentMode is required"),
  transactionId: z.string().min(1, "transactionId is required"),
  status: z.string().min(1, "status is required"),
  createdAt: dateTransform,
  updatedAt: dateTransform,
});

const bulkStudentFeePaymentSchema = z.array(studentFeePaymentItemSchema);

interface DbError {
  code?: string;
  detail?: string;
  message?: string;
}

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const onConflict = searchParams.get("onConflict") || "fail"; // 'fail' | 'ignore'

    if (onConflict !== "fail" && onConflict !== "ignore") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid onConflict parameter. Supported values: 'fail', 'ignore'",
        },
        { status: 400 },
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON body" },
        { status: 400 },
      );
    }

    if (!Array.isArray(body)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Request body must be a JSON array of student fee payment objects",
        },
        { status: 400 },
      );
    }

    if (body.length === 0) {
      return NextResponse.json(
        { success: false, message: "The fee payments list cannot be empty" },
        { status: 400 },
      );
    }

    // 1. Zod Validation
    const parsed = bulkStudentFeePaymentSchema.safeParse(body);
    if (!parsed.success) {
      const formattedErrors = parsed.error.issues.map((err) => {
        const index = err.path[0];
        const field = err.path.slice(1).join(".");
        return { index, field, message: err.message };
      });

      return NextResponse.json(
        {
          success: false,
          message: "Validation failed for one or more records.",
          errors: formattedErrors,
        },
        { status: 400 },
      );
    }

    const records = parsed.data;

    // 2. Referenced Data Existence Validation (studentId)
    const uniqueStudentIds = Array.from(
      new Set(records.map((r) => r.studentId)),
    );
    const existingStudents = await db
      .select({ id: AdmittedStudentTable.id })
      .from(AdmittedStudentTable)
      .where(inArray(AdmittedStudentTable.id, uniqueStudentIds));
    const existingStudentIdsSet = new Set(existingStudents.map((s) => s.id));
    const missingStudentIds = uniqueStudentIds.filter(
      (id) => !existingStudentIdsSet.has(id),
    );

    if (missingStudentIds.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Referenced student entities do not exist in admitted_students.",
          errors: { missingStudentIds },
        },
        { status: 400 },
      );
    }

    // 3. Database Insertion
    try {
      if (onConflict === "ignore") {
        const result = await db
          .insert(StudentFeePaymentTable)
          .values(records)
          .onConflictDoNothing()
          .returning({ id: StudentFeePaymentTable.id });

        const insertedCount = result.length;
        const ignoredCount = records.length - insertedCount;

        return NextResponse.json({
          success: true,
          message: `Process completed: ${insertedCount} fee payment records inserted, ${ignoredCount} conflicts ignored.`,
          insertedCount,
          ignoredCount,
        });
      }

      // 'fail' mode (atomic transaction)
      const result = await db.transaction(async (tx) => {
        return await tx
          .insert(StudentFeePaymentTable)
          .values(records)
          .returning({ id: StudentFeePaymentTable.id });
      });

      return NextResponse.json({
        success: true,
        message: `Successfully inserted all ${result.length} fee payment records.`,
        count: result.length,
      });
    } catch (dbErr) {
      const dbError = ((dbErr as any).cause || dbErr) as DbError;
      console.error("[Bulk Insert Student Fee Payments DB Error]:", dbError);

      if (dbError.code === "23505") {
        return NextResponse.json(
          {
            success: false,
            message:
              "Database insertion failed: A duplicate record already exists.",
            detail:
              dbError.detail || "Unique constraint violation on fee payments.",
          },
          { status: 409 },
        );
      }

      if (dbError.code === "23503") {
        return NextResponse.json(
          {
            success: false,
            message:
              "Database insertion failed: A foreign key constraint was violated.",
            detail:
              dbError.detail || "studentId references a non-existent student.",
          },
          { status: 400 },
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: "Internal Server Error during database insertion",
          error: dbError.message || String(dbError),
        },
        { status: 500 },
      );
    }
  } catch (error) {
    const err = error as Error;
    console.error("[Bulk Insert Student Fee Payments API Route Error]:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
