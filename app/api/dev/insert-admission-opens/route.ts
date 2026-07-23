import { createId } from "@paralleldrive/cuid2";
import { inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import * as z from "zod";
import { db } from "@/lib/db";
import { admissionOpenTable, batchTable } from "@/lib/db/schema";

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
    throw new Error("date is required");
  }
  const str = String(val).trim();
  const clean = str.includes("T") ? str.split("T")[0] : str;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    throw new Error("Invalid date format");
  }
  return clean;
});

const dateStringTransformOptional = z
  .any()
  .optional()
  .nullable()
  .transform((val) => {
    if (!val || String(val).trim() === "") {
      return null;
    }
    const str = String(val).trim();
    const clean = str.includes("T") ? str.split("T")[0] : str;
    return /^\d{4}-\d{2}-\d{2}$/.test(clean) ? clean : null;
  });

const admissionOpenItemSchema = z.object({
  id: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val || createId()),
  batchId: z.string().min(1, "Batch ID is required"),
  startDate: dateStringTransform,
  endDate: dateStringTransform,
  lateFee: z
    .number()
    .optional()
    .nullable()
    .transform((val) => val || 0),
  practicalFee: z
    .number()
    .optional()
    .nullable()
    .transform((val) => (val === null ? 500 : val)),
  isDateExtended: z
    .boolean()
    .optional()
    .nullable()
    .transform((val) => (val === null ? false : val)),
  extendedDate: dateStringTransformOptional,
  createdAt: dateTransform,
  updatedAt: dateTransform,
});

const bulkAdmissionOpenSchema = z.array(admissionOpenItemSchema);

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
            "Request body must be a JSON array of admission open objects",
        },
        { status: 400 },
      );
    }

    if (body.length === 0) {
      return NextResponse.json(
        { success: false, message: "The admission open list cannot be empty" },
        { status: 400 },
      );
    }

    // 1. Zod Validation
    const parsed = bulkAdmissionOpenSchema.safeParse(body);
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

    const admissionOpens = parsed.data;

    // 2. Referenced Data Existence Validation (batchId)
    const uniqueBatchIds = Array.from(
      new Set(admissionOpens.map((a) => a.batchId)),
    );
    const existingBatches = await db
      .select({ id: batchTable.id })
      .from(batchTable)
      .where(inArray(batchTable.id, uniqueBatchIds));
    const existingBatchIdsSet = new Set(existingBatches.map((b) => b.id));
    const missingBatchIds = uniqueBatchIds.filter(
      (id) => !existingBatchIdsSet.has(id),
    );

    if (missingBatchIds.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Referenced batch entities do not exist.",
          errors: { missingBatchIds },
        },
        { status: 400 },
      );
    }

    // 3. Database Insertion
    try {
      if (onConflict === "ignore") {
        const result = await db
          .insert(admissionOpenTable)
          .values(admissionOpens)
          .onConflictDoNothing()
          .returning({ id: admissionOpenTable.id });

        const insertedCount = result.length;
        const ignoredCount = admissionOpens.length - insertedCount;

        return NextResponse.json({
          success: true,
          message: `Process completed: ${insertedCount} admission open settings inserted, ${ignoredCount} conflicts ignored.`,
          insertedCount,
          ignoredCount,
        });
      }

      // 'fail' mode (atomic transaction)
      const result = await db.transaction(async (tx) => {
        return await tx
          .insert(admissionOpenTable)
          .values(admissionOpens)
          .returning({ id: admissionOpenTable.id });
      });

      return NextResponse.json({
        success: true,
        message: `Successfully inserted all ${result.length} admission open settings.`,
        count: result.length,
      });
    } catch (dbErr) {
      const dbError = ((dbErr as any).cause || dbErr) as DbError;
      console.error("[Bulk Insert Admission Opens DB Error]:", dbError);

      if (dbError.code === "23505") {
        return NextResponse.json(
          {
            success: false,
            message:
              "Database insertion failed: A duplicate record already exists.",
            detail: dbError.detail || "Unique constraint violation on batchId.",
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
              dbError.detail || "batchId references a non-existent batch.",
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
    console.error("[Bulk Insert Admission Opens API Route Error]:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
