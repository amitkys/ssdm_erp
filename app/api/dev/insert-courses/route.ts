import { createId } from "@paralleldrive/cuid2";
import { inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import * as z from "zod";
import { db } from "@/lib/db";
import { courseTable, departmentTable } from "@/lib/db/schema";

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

const courseItemSchema = z.object({
  id: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val || createId()),
  name: z.string().min(1, "Course name is required"),
  code: z.string().min(1, "Course code is required"),
  type: z
    .enum([
      "UG Regular",
      "UG Part Time",
      "UG Vocational",
      "PG Regular",
      "PG Part Time",
      "PG Vocational",
    ])
    .optional()
    .nullable()
    .transform((val) => val || "UG Regular"),
  description: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val || null),
  departmentId: z.string().min(1, "Department ID is required"),
  duration: z
    .number()
    .min(2, "Duration must be between 2 and 8")
    .max(8, "Duration must be between 2 and 8")
    .optional()
    .nullable()
    .transform((val) => (val === null ? 4 : val)),
  isActive: z
    .boolean()
    .optional()
    .nullable()
    .transform((val) => (val === null ? true : val)),
  createdAt: dateTransform,
  updatedAt: dateTransform,
});

const bulkCourseSchema = z.array(courseItemSchema);

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
          message: "Request body must be a JSON array of course objects",
        },
        { status: 400 },
      );
    }

    if (body.length === 0) {
      return NextResponse.json(
        { success: false, message: "The courses list cannot be empty" },
        { status: 400 },
      );
    }

    // 1. Zod Validation
    const parsed = bulkCourseSchema.safeParse(body);
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

    const courses = parsed.data;

    // 2. Referenced Data Existence Validation (departmentId)
    const uniqueDeptIds = Array.from(
      new Set(courses.map((c) => c.departmentId)),
    );
    const existingDepts = await db
      .select({ id: departmentTable.id })
      .from(departmentTable)
      .where(inArray(departmentTable.id, uniqueDeptIds));
    const existingDeptIdsSet = new Set(existingDepts.map((d) => d.id));
    const missingDeptIds = uniqueDeptIds.filter(
      (id) => !existingDeptIdsSet.has(id),
    );

    if (missingDeptIds.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Referenced department entities do not exist.",
          errors: { missingDeptIds },
        },
        { status: 400 },
      );
    }

    // 3. Database Insertion
    try {
      if (onConflict === "ignore") {
        const result = await db
          .insert(courseTable)
          .values(courses)
          .onConflictDoNothing()
          .returning({ id: courseTable.id });

        const insertedCount = result.length;
        const ignoredCount = courses.length - insertedCount;

        return NextResponse.json({
          success: true,
          message: `Process completed: ${insertedCount} courses inserted, ${ignoredCount} conflicts ignored.`,
          insertedCount,
          ignoredCount,
        });
      }

      // 'fail' mode (atomic transaction)
      const result = await db.transaction(async (tx) => {
        return await tx
          .insert(courseTable)
          .values(courses)
          .returning({ id: courseTable.id });
      });

      return NextResponse.json({
        success: true,
        message: `Successfully inserted all ${result.length} courses.`,
        count: result.length,
      });
    } catch (dbErr) {
      const dbError = ((dbErr as any).cause || dbErr) as DbError;
      console.error("[Bulk Insert Courses DB Error]:", dbError);

      if (dbError.code === "23505") {
        return NextResponse.json(
          {
            success: false,
            message:
              "Database insertion failed: A duplicate record already exists.",
            detail:
              dbError.detail || "Unique constraint violation on name or code.",
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
              "departmentId references a non-existent department.",
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
    console.error("[Bulk Insert Courses API Route Error]:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
