import { createId } from "@paralleldrive/cuid2";
import { inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import * as z from "zod";
import { db } from "@/lib/db";
import {
  AdmittedStudentTable,
  batchTable,
  subjectTable,
} from "@/lib/db/schema";

const arrayPreprocessSchema = z.preprocess((val) => {
  if (val === null || val === undefined || val === "") {
    return [];
  }
  if (Array.isArray(val)) {
    return val;
  }
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {}
    return [val];
  }
  return [];
}, z.array(z.string()));

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

const dateStringTransform = z.any().transform((val) => {
  if (!val || String(val).trim() === "") {
    throw new Error("DOB is required");
  }
  const str = String(val).trim();
  const clean = str.includes("T") ? str.split("T")[0] : str;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    throw new Error("Invalid DOB format");
  }
  return clean;
});

const admittedStudentItemSchema = z.object({
  id: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val || createId()),
  UAN: z.string().min(1, "UAN is required"),
  registrationNumber: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val || null),
  universityRoll: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val || null),
  collegeRoll: z.string().min(1, "College roll is required"),
  admissionNumber: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val || null),
  confidentialNumber: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val || null),
  profileNumber: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val || null),
  admissionType: z
    .enum(["MERIT", "SPORT", "MANAGEMENT QUOTA", "OTHER"])
    .optional()
    .nullable()
    .transform((val) => val || null),
  ABCID: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val || null),
  name: z.string().min(1, "Name is required"),
  avatar: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val || ""),
  DOB: dateStringTransform,
  AadharNumber: z
    .string()
    .length(12, "Aadhar Number must be exactly 12 digits")
    .regex(/^\d+$/, "Aadhar Number must contain only digits"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .transform((val) => {
      const digits = val.replace(/\D/g, "");
      return digits.slice(-10); // get last 10 digits
    }),
  email: z
    .string()
    .email("Invalid email address")
    .transform((val) => val.trim().toLowerCase()),
  gender: z.enum(["Male", "Female", "Transgender"]),
  fathersName: z.string().min(1, "Father's name is required"),
  mothersName: z.string().min(1, "Mother's name is required"),
  religion: z.string().min(1, "Religion is required"),
  caste: z.enum(["GEN", "BC", "EBC", "SC", "ST", "OTHER"]),
  reservation: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val || null),
  isMinority: z
    .boolean()
    .optional()
    .nullable()
    .transform((val) => (val === null ? false : val)),
  batchId: z.string().min(1, "Batch ID is required"),
  currentSemesterCount: z
    .number()
    .int()
    .min(1)
    .optional()
    .nullable()
    .transform((val) => (val === null ? 1 : val)),
  subMJC: z.string().min(1, "Major Subject (subMJC) is required"),
  subMIC: arrayPreprocessSchema.optional().default([]),
  subMDC: arrayPreprocessSchema.optional().default([]),
  subAEC: arrayPreprocessSchema.optional().default([]),
  subSEC: arrayPreprocessSchema.optional().default([]),
  subVAC: arrayPreprocessSchema.optional().default([]),
  city: z.string().min(1, "City is required"),
  district: z.string().min(1, "District is required"),
  state: z.string().min(1, "State is required"),
  pinCode: z.number().int().min(100000).max(999999),
  isInternshipStarted: z
    .boolean()
    .optional()
    .nullable()
    .transform((val) => (val === null ? false : val)),
  internshipFee: z
    .number()
    .optional()
    .nullable()
    .transform((val) => (val === null ? 0 : val)),
  isProfileCompleted: z
    .boolean()
    .optional()
    .nullable()
    .transform((val) => (val === null ? false : val)),
  isDetained: z
    .boolean()
    .optional()
    .nullable()
    .transform((val) => (val === null ? false : val)),
  isActive: z
    .boolean()
    .optional()
    .nullable()
    .transform((val) => (val === null ? true : val)),
  detainRemark: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val || ""),
  createdAt: dateTransform,
  updatedAt: dateTransform,
});

const bulkAdmittedStudentSchema = z.array(admittedStudentItemSchema);

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
            "Request body must be a JSON array of admitted student objects",
        },
        { status: 400 },
      );
    }

    if (body.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "The admitted students list cannot be empty",
        },
        { status: 400 },
      );
    }

    // 1. Zod Validation
    const parsed = bulkAdmittedStudentSchema.safeParse(body);
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

    const students = parsed.data;

    // 2. Referenced Data Existence Validation (batchId and subMJC)
    const uniqueBatchIds = Array.from(new Set(students.map((s) => s.batchId)));
    const uniqueMjcIds = Array.from(new Set(students.map((s) => s.subMJC)));

    // Fetch existing batches
    const existingBatches = await db
      .select({ id: batchTable.id })
      .from(batchTable)
      .where(inArray(batchTable.id, uniqueBatchIds));
    const existingBatchIdsSet = new Set(existingBatches.map((b) => b.id));
    const missingBatchIds = uniqueBatchIds.filter(
      (id) => !existingBatchIdsSet.has(id),
    );

    // Fetch existing MJC subjects
    const existingSubjects = await db
      .select({ id: subjectTable.id })
      .from(subjectTable)
      .where(inArray(subjectTable.id, uniqueMjcIds));
    const existingSubjectIdsSet = new Set(existingSubjects.map((s) => s.id));
    const missingMjcIds = uniqueMjcIds.filter(
      (id) => !existingSubjectIdsSet.has(id),
    );

    if (missingBatchIds.length > 0 || missingMjcIds.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Referenced database entities do not exist.",
          errors: {
            missingBatchIds:
              missingBatchIds.length > 0 ? missingBatchIds : undefined,
            missingMjcIds: missingMjcIds.length > 0 ? missingMjcIds : undefined,
          },
        },
        { status: 400 },
      );
    }

    // 3. Database Insertion
    try {
      if (onConflict === "ignore") {
        const result = await db
          .insert(AdmittedStudentTable)
          .values(students)
          .onConflictDoNothing()
          .returning({ id: AdmittedStudentTable.id });

        const insertedCount = result.length;
        const ignoredCount = students.length - insertedCount;

        return NextResponse.json({
          success: true,
          message: `Process completed: ${insertedCount} admitted students inserted, ${ignoredCount} conflicts ignored.`,
          insertedCount,
          ignoredCount,
        });
      }

      // 'fail' mode (atomic transaction)
      const result = await db.transaction(async (tx) => {
        return await tx
          .insert(AdmittedStudentTable)
          .values(students)
          .returning({ id: AdmittedStudentTable.id });
      });

      return NextResponse.json({
        success: true,
        message: `Successfully inserted all ${result.length} admitted students.`,
        count: result.length,
      });
    } catch (dbErr) {
      const dbError = ((dbErr as any).cause || dbErr) as DbError;
      console.error("[Bulk Insert Admitted Students DB Error]:", dbError);

      if (dbError.code === "23505") {
        return NextResponse.json(
          {
            success: false,
            message:
              "Database insertion failed: A duplicate record already exists.",
            detail:
              dbError.detail ||
              "Unique constraint violation (UAN, collegeRoll, email, AadharNumber, etc.).",
          },
          { status: 409 },
        );
      }

      if (dbError.code === "23514") {
        return NextResponse.json(
          {
            success: false,
            message:
              "Database insertion failed: A check constraint was violated.",
            detail:
              dbError.message ||
              "Invalid enum value for gender, admissionType, or caste.",
          },
          { status: 400 },
        );
      }

      if (dbError.code === "23503") {
        return NextResponse.json(
          {
            success: false,
            message:
              "Database insertion failed: A foreign key constraint was violated.",
            detail:
              dbError.detail ||
              "batchId or subMJC references a non-existent entity.",
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
    console.error("[Bulk Insert Admitted Students API Route Error]:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
