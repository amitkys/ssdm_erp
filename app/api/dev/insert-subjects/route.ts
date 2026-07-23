import { createId } from "@paralleldrive/cuid2";
import { NextResponse } from "next/server";
import * as z from "zod";
import { db } from "@/lib/db";
import { subjectTable } from "@/lib/db/schema";

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

const subjectItemSchema = z.object({
  id: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val || createId()),
  code: z.string().min(1, "Subject code is required"),
  name: z.string().min(1, "Subject name is required"),
  description: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val || null),
  category: z
    .enum(["SCIENCE", "COMMERCE", "ARTS", "GENERAL"])
    .optional()
    .nullable()
    .transform((val) => val || "SCIENCE"),
  isActive: z
    .boolean()
    .optional()
    .nullable()
    .transform((val) => (val === null ? true : val)),
  hasPractical: z
    .boolean()
    .optional()
    .nullable()
    .transform((val) => (val === null ? false : val)),
  practicalFee: z
    .number()
    .optional()
    .nullable()
    .transform((val) => val || 0),
  createdAt: dateTransform,
  updatedAt: dateTransform,
});

const bulkSubjectSchema = z.array(subjectItemSchema);

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
          message: "Request body must be a JSON array of subject objects",
        },
        { status: 400 },
      );
    }

    if (body.length === 0) {
      return NextResponse.json(
        { success: false, message: "The subjects list cannot be empty" },
        { status: 400 },
      );
    }

    // 1. Zod Validation
    const parsed = bulkSubjectSchema.safeParse(body);
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

    const recordsToInsert = parsed.data;

    // 2. Database Insertion
    try {
      if (onConflict === "ignore") {
        const result = await db
          .insert(subjectTable)
          .values(recordsToInsert)
          .onConflictDoNothing()
          .returning({ id: subjectTable.id });

        const insertedCount = result.length;
        const ignoredCount = recordsToInsert.length - insertedCount;

        return NextResponse.json({
          success: true,
          message: `Process completed: ${insertedCount} subjects inserted, ${ignoredCount} conflicts ignored.`,
          insertedCount,
          ignoredCount,
        });
      }

      // 'fail' mode (atomic transaction)
      const result = await db.transaction(async (tx) => {
        return await tx
          .insert(subjectTable)
          .values(recordsToInsert)
          .returning({ id: subjectTable.id });
      });

      return NextResponse.json({
        success: true,
        message: `Successfully inserted all ${result.length} subjects.`,
        count: result.length,
      });
    } catch (dbErr) {
      const dbError = ((dbErr as any).cause || dbErr) as DbError;
      console.error("[Bulk Insert Subjects DB Error]:", dbError);

      if (dbError.code === "23505") {
        return NextResponse.json(
          {
            success: false,
            message:
              "Database insertion failed: A duplicate record already exists.",
            detail: dbError.detail || "Unique constraint violation on code.",
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
              "Category must be one of: SCIENCE, COMMERCE, ARTS, GENERAL.",
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
    console.error("[Bulk Insert Subjects API Route Error]:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
