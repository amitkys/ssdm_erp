import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import * as z from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdmittedStudentTable } from "@/lib/db/schema";
import { user } from "@/lib/db/schema/auth-schema";

// ─── HELPERS ────────────────────────────────────────────────────────────────────

/**
 * Better Auth requires an email to create a user account.
 * Since students don't have real emails, we create a fake one from their UAN.
 *
 * Steps:
 *   1. Strip all non-alphanumeric chars from UAN (handles invisible Unicode from spreadsheet paste)
 *   2. Lowercase the cleaned UAN
 *   3. Append "@student.ssdm.local" to make it a valid email format
 *
 * Example: UAN "AB/2023/1234" → "ab20231234@student.ssdm.local"
 */
function generateStudentEmail(uan: string): string {
  const cleanUAN = uan.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  return `${cleanUAN}@student.ssdm.local`;
}

/**
 * Generate the default login password for a student.
 *
 * Formula: first 4 letters of name (lowercase, spaces/symbols removed) + last 4 digits of UAN
 *
 * Edge case: If the student's name has 3 or fewer alphabetic characters,
 * we take last 5 digits of UAN instead to keep the password long enough.
 *
 * Example:
 *   name = "Rahul Kumar", UAN = "AB/2023/1234"
 *   cleanName = "rahulkumar" → first 4 = "rahu"
 *   cleanUAN  = "AB20231234"  → last 4  = "1234"
 *   password  = "rahu1234"
 */
function generateStudentPassword(name: string, uan: string): string {
  // Strip everything except A-Z/a-z, then lowercase
  const cleanName = name.replace(/[^a-zA-Z]/g, "").toLowerCase();
  // Strip everything except alphanumeric
  const cleanUAN = uan.replace(/[^a-zA-Z0-9]/g, "");
  if (cleanName.length <= 3) {
    return `${cleanName}${cleanUAN.slice(-5)}`;
  }
  return `${cleanName.slice(0, 4)}${cleanUAN.slice(-4)}`;
}

// ─── ZOD SCHEMA ─────────────────────────────────────────────────────────────────

/**
 * Request body validation for the signup endpoint.
 *
 * Expected JSON payload:
 *   {
 *     "UAN": "AB/2023/1234",        — Student's University Application Number
 *     "session": "2023-2027",        — Academic session (for reference only, stored in response)
 *     "semesterCount": 5             — Which semester the student is currently in
 *   }
 */
const signupAdmittedStudentSchema = z.object({
  UAN: z
    .string()
    .trim()
    .transform((val) => val.replace(/[^a-zA-Z0-9]/g, "")) // strip invisible chars from copy-paste
    .pipe(z.string().min(1, "UAN is required")),
  session: z
    .string()
    .trim()
    .min(1, "Session is required (e.g. 2023-2027)"),
  semesterCount: z
    .number()
    .int()
    .min(1, "Semester count must be at least 1"),
});

// ─── POST HANDLER ───────────────────────────────────────────────────────────────

/**
 * POST /api/dev/signup-admitted-student
 *
 * Creates a Better Auth login account for a single admitted student.
 *
 * Flow:
 *   1. Parse & validate the request body (UAN, session, semesterCount)
 *   2. Find the student in AdmittedStudentTable by UAN
 *   3. Update the student's current semester count
 *   4. Generate login credentials (synthetic email + password)
 *   5. Create the Better Auth user account with role "student"
 *   6. Return the generated login credentials in the response
 */
export async function POST(req: Request) {
  try {
    // 1. Parse the raw JSON body from the request
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON body" },
        { status: 400 },
      );
    }

    // 2. Validate the payload against our Zod schema (UAN, session, semesterCount)
    const parsed = signupAdmittedStudentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: parsed.error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 },
      );
    }

    const { UAN, session, semesterCount } = parsed.data;

    // 3. Look up the student in AdmittedStudentTable using their UAN
    const student = await db.query.AdmittedStudentTable.findFirst({
      where: eq(AdmittedStudentTable.UAN, UAN),
    });

    if (!student) {
      return NextResponse.json(
        {
          success: false,
          message: `No admitted student found with UAN: ${UAN}`,
        },
        { status: 404 },
      );
    }

    // 4. Update the student's current semester count in the database
    await db
      .update(AdmittedStudentTable)
      .set({ currentSemesterCount: semesterCount })
      .where(eq(AdmittedStudentTable.id, student.id));

    // 5. Build the login credentials:
    //    - email:    fake email derived from UAN (e.g. "ab20231234@student.ssdm.local")
    //    - password: first4CharsOfName + last4DigitsOfUAN (e.g. "rahu1234")
    const email = generateStudentEmail(UAN);
    const password = generateStudentPassword(student.name, UAN);

    // 6. Prevent duplicate accounts — check if this email already has a Better Auth user
    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, email),
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: `Auth account already exists for UAN: ${UAN}. Login email: ${email}`,
        },
        { status: 409 },
      );
    }

    // 7. Register the student in Better Auth with role "student"
    await auth.api.signUpEmail({
      body: {
        name: student.name,
        email,
        password,
        role: "student",
      },
    });

    console.log(
      `[Signup Admitted Student] Created auth for ${UAN} → ${email}`,
    );

    return NextResponse.json({
      success: true,
      message: `Auth account created successfully for ${student.name}`,
      data: {
        UAN,
        name: student.name,
        session,
        semesterCount,
        loginUsername: UAN,
        loginEmail: email,
        loginPassword: password,
      },
    });
  } catch (error) {
    const err = error as Error;
    console.error("[Signup Admitted Student] Error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
