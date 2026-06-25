import { createId } from "@paralleldrive/cuid2";
import { inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import * as z from "zod";
import { db } from "@/lib/db";
import { session, user } from "@/lib/db/schema";

const sessionItemSchema = z.object({
  id: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val || createId()),
  expiresAt: z.any().transform((val) => {
    if (!val) {
      throw new Error("expires_at/expiresAt is required");
    }
    return new Date(val);
  }),
  token: z.string().min(1, "token is required"),
  createdAt: z
    .any()
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : new Date())),
  updatedAt: z
    .any()
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : new Date())),
  ipAddress: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val || null),
  userAgent: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val || null),
  userId: z.string().min(1, "user_id/userId is required"),
});

const preprocessSession = z.preprocess((val: any) => {
  if (val && typeof val === "object") {
    return {
      id: val.id,
      expiresAt: val.expires_at || val.expiresAt,
      token: val.token,
      createdAt: val.created_at || val.createdAt,
      updatedAt: val.updated_at || val.updatedAt,
      ipAddress: val.ip_address || val.ipAddress,
      userAgent: val.user_agent || val.userAgent,
      userId: val.user_id || val.userId,
    };
  }
  return val;
}, sessionItemSchema);

const bulkSessionSchema = z.array(preprocessSession);

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
          message: "Request body must be a JSON array of session objects",
        },
        { status: 400 },
      );
    }

    if (body.length === 0) {
      return NextResponse.json(
        { success: false, message: "The sessions list cannot be empty" },
        { status: 400 },
      );
    }

    // 1. Zod Validation
    const parsed = bulkSessionSchema.safeParse(body);
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

    const sessionsData = parsed.data;

    // 2. Referenced Data Existence Validation & Auto-creation of Placeholder Users
    const uniqueUserIds = Array.from(
      new Set(sessionsData.map((s) => s.userId)),
    );

    // Fetch existing users
    const existingUsers = await db
      .select({ id: user.id })
      .from(user)
      .where(inArray(user.id, uniqueUserIds));
    const existingUserIdsSet = new Set(existingUsers.map((u) => u.id));
    const missingUserIds = uniqueUserIds.filter(
      (id) => !existingUserIdsSet.has(id),
    );

    // Create placeholder users for any missing user IDs to satisfy foreign keys
    if (missingUserIds.length > 0) {
      const placeholderUsers = missingUserIds.map((userId) => ({
        id: userId,
        name: `Seeded Admin (${userId.slice(0, 6)})`,
        email: `seeded-admin-${userId.toLowerCase()}@example.com`,
        emailVerified: true,
        role: "admin" as const,
      }));
      await db.insert(user).values(placeholderUsers);
    }

    // 3. Database Insertion
    try {
      if (onConflict === "ignore") {
        const result = await db
          .insert(session)
          .values(sessionsData)
          .onConflictDoNothing()
          .returning({ id: session.id });

        const insertedCount = result.length;
        const ignoredCount = sessionsData.length - insertedCount;

        return NextResponse.json({
          success: true,
          message: `Process completed: ${insertedCount} sessions inserted, ${ignoredCount} conflicts ignored.`,
          insertedCount,
          ignoredCount,
        });
      }

      // 'fail' mode (atomic transaction)
      const result = await db.transaction(async (tx) => {
        return await tx
          .insert(session)
          .values(sessionsData)
          .returning({ id: session.id });
      });

      return NextResponse.json({
        success: true,
        message: `Successfully inserted all ${result.length} sessions.`,
        count: result.length,
      });
    } catch (dbErr) {
      const dbError = ((dbErr as any).cause || dbErr) as DbError;
      console.error("[Bulk Insert Sessions DB Error]:", dbError);

      if (dbError.code === "23505") {
        return NextResponse.json(
          {
            success: false,
            message:
              "Database insertion failed: A duplicate record already exists.",
            detail: dbError.detail || "Unique constraint violation on token.",
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
            detail: dbError.detail || "userId references a non-existent user.",
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
    console.error("[Bulk Insert Sessions API Route Error]:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
