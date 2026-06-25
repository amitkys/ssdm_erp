import { createId } from "@paralleldrive/cuid2";
import { inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import * as z from "zod";
import { db } from "@/lib/db";
import { academicSessionTable, batchTable, courseTable } from "@/lib/db/schema";

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

const batchItemSchema = z.object({
  id: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val || createId()),
  courseId: z.string().min(1, "Course ID is required"),
  academicSessionId: z.string().min(1, "Academic Session ID is required"),
  perSemesterFee: z
    .number()
    .nonnegative("perSemesterFee must be a non-negative number"),
  isActive: z
    .boolean()
    .optional()
    .nullable()
    .transform((val) => (val === null ? true : val)),
  createdAt: dateTransform,
  updatedAt: dateTransform,
});

const bulkBatchSchema = z.array(batchItemSchema);

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
          message: "Request body must be a JSON array of batch objects",
        },
        { status: 400 },
      );
    }

    if (body.length === 0) {
      return NextResponse.json(
        { success: false, message: "The batches list cannot be empty" },
        { status: 400 },
      );
    }

    // 1. Zod Validation
    const parsed = bulkBatchSchema.safeParse(body);
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

    const batches = parsed.data;

    // 2. Referenced Data Existence Validation (courseId & academicSessionId)
    const uniqueCourseIds = Array.from(new Set(batches.map((b) => b.courseId)));
    const uniqueSessionIds = Array.from(
      new Set(batches.map((b) => b.academicSessionId)),
    );

    // Fetch existing courses
    const existingCourses = await db
      .select({ id: courseTable.id })
      .from(courseTable)
      .where(inArray(courseTable.id, uniqueCourseIds));
    const existingCourseIdsSet = new Set(existingCourses.map((c) => c.id));
    const missingCourseIds = uniqueCourseIds.filter(
      (id) => !existingCourseIdsSet.has(id),
    );

    // Fetch existing academic sessions
    const existingSessions = await db
      .select({ id: academicSessionTable.id })
      .from(academicSessionTable)
      .where(inArray(academicSessionTable.id, uniqueSessionIds));
    const existingSessionIdsSet = new Set(existingSessions.map((s) => s.id));
    const missingSessionIds = uniqueSessionIds.filter(
      (id) => !existingSessionIdsSet.has(id),
    );

    if (missingCourseIds.length > 0 || missingSessionIds.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Referenced database entities do not exist.",
          errors: {
            missingCourseIds:
              missingCourseIds.length > 0 ? missingCourseIds : undefined,
            missingSessionIds:
              missingSessionIds.length > 0 ? missingSessionIds : undefined,
          },
        },
        { status: 400 },
      );
    }

    // 3. Database Insertion
    try {
      if (onConflict === "ignore") {
        const result = await db
          .insert(batchTable)
          .values(batches)
          .onConflictDoNothing()
          .returning({ id: batchTable.id });

        const insertedCount = result.length;
        const ignoredCount = batches.length - insertedCount;

        return NextResponse.json({
          success: true,
          message: `Process completed: ${insertedCount} batches inserted, ${ignoredCount} conflicts ignored.`,
          insertedCount,
          ignoredCount,
        });
      }

      // 'fail' mode (atomic transaction)
      const result = await db.transaction(async (tx) => {
        return await tx
          .insert(batchTable)
          .values(batches)
          .returning({ id: batchTable.id });
      });

      return NextResponse.json({
        success: true,
        message: `Successfully inserted all ${result.length} batches.`,
        count: result.length,
      });
    } catch (dbErr) {
      const dbError = ((dbErr as any).cause || dbErr) as DbError;
      console.error("[Bulk Insert Batches DB Error]:", dbError);

      if (dbError.code === "23505") {
        return NextResponse.json(
          {
            success: false,
            message:
              "Database insertion failed: A duplicate record already exists.",
            detail:
              dbError.detail ||
              "Unique constraint violation on batch parameters.",
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
              dbError.detail ||
              "courseId or academicSessionId references a non-existent record.",
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
    console.error("[Bulk Insert Batches API Route Error]:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
