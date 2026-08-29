/**
 * ─── ADD USER SCRIPT ────────────────────────────────────────────────────────────
 *
 * Creates a Better Auth login account for an existing admitted student.
 * The student MUST already exist in the `admitted_students` table.
 *
 * ─── USAGE ──────────────────────────────────────────────────────────────────────
 *
 *   bun run script/add-user.ts <uan_number> [password]
 *
 * ─── EXAMPLES ───────────────────────────────────────────────────────────────────
 *
 *   # Auto-generated password (recommended for bulk use)
 *   bun run script/add-user.ts PPUP00072
 *
 *   # Custom password
 *   bun run script/add-user.ts PPUP00072 mysecurepass
 *
 * ─── HOW IT WORKS ───────────────────────────────────────────────────────────────
 *
 *   1. Looks up the student in `admitted_students` by UAN
 *   2. Generates a synthetic email:  uan (lowercased) + "@student.ssdm.local"
 *      e.g. PPUP00072 → ppup00072@student.ssdm.local
 *   3. Checks if an auth account already exists (skips if yes)
 *   4. Creates a Better Auth user with role "student"
 *
 * ─── PASSWORD GENERATION (when not provided) ────────────────────────────────────
 *
 *   Formula:  first 4 alpha chars of name (lowercase, no spaces)
 *           + last 4 digits of Aadhar number
 *
 *   Fallback: if Aadhar is missing → last 4 digits of UAN instead
 *
 *   Examples:
 *     name = "Rahul Kumar", aadhar = "123456789012" → "rahu9012"
 *     name = "Priya Singh", aadhar = null, UAN = "PPUP00072" → "priy0072"
 *
 * ────────────────────────────────────────────────────────────────────────────────
 */

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { AdmittedStudentTable } from "@/lib/db/schema";
import { user } from "@/lib/db/schema/auth-schema";
import { auth } from "@/lib/auth";

// ─── HELPERS ────────────────────────────────────────────────────────────────────

/**
 * Generate synthetic email from UAN.
 * Strips non-alphanumeric chars, lowercases, appends domain.
 *
 * Example: "PPUP00072" → "ppup00072@student.ssdm.local"
 */
function generateStudentEmail(uan: string): string {
  const cleanUAN = uan.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  return `${cleanUAN}@student.ssdm.local`;
}

/**
 * Generate default password for a student.
 *
 * Formula: first 4 letters of name (lowercase, no spaces) + last 4 digits of Aadhar.
 * If Aadhar is not available, use last 4 digits of UAN instead.
 *
 * Example:
 *   name = "Rahul Kumar", aadhar = "123456789012"
 *   → "rahu9012"
 *
 *   name = "Rahul Kumar", aadhar = null, UAN = "PPUP00072"
 *   → "rahu0072"
 */
function generateStudentPassword(
  name: string,
  uan: string,
  aadhar: string | null,
): string {
  // First 4 alpha chars of name, lowercase, no spaces
  const cleanName = name.replace(/[^a-zA-Z]/g, "").toLowerCase();
  const namePrefix = cleanName.slice(0, 4);

  if (aadhar) {
    // Last 4 digits of Aadhar
    const aadharDigits = aadhar.replace(/[^0-9]/g, "");
    if (aadharDigits.length >= 4) {
      return `${namePrefix}${aadharDigits.slice(-4)}`;
    }
  }

  // Fallback: last 4 digits of UAN
  const uanDigits = uan.replace(/[^0-9]/g, "");
  return `${namePrefix}${uanDigits.slice(-4)}`;
}

// ─── MAIN ───────────────────────────────────────────────────────────────────────

async function addUser(rawUAN: string, customPassword?: string) {
  // 1. Clean UAN (strip invisible chars from copy-paste)
  const UAN = rawUAN.replace(/[^a-zA-Z0-9]/g, "");

  console.log(`\n🔍 Looking up admitted student with UAN: ${UAN}`);

  // 2. Find the student in AdmittedStudentTable
  const student = await db.query.AdmittedStudentTable.findFirst({
    where: eq(AdmittedStudentTable.UAN, UAN),
  });

  if (!student) {
    console.error(`❌ No admitted student found with UAN: ${UAN}`);
    process.exit(1);
  }

  console.log(`✅ Found student: ${student.name}`);

  // 3. Generate email
  const email = generateStudentEmail(UAN);

  // 4. Check if auth account already exists
  const existingUser = await db.query.user.findFirst({
    where: eq(user.email, email),
  });

  if (existingUser) {
    console.error(`⚠️  Auth account already exists for ${email}`);
    process.exit(1);
  }

  // 5. Determine password
  const password =
    customPassword ||
    generateStudentPassword(student.name, UAN, student.AadharNumber);

  // 6. Create Better Auth account
  try {
    await auth.api.signUpEmail({
      body: { name: student.name, email, password, role: "student" },
    });

    console.log(`\n✅ User created successfully!`);
    console.log(`   Name:     ${student.name}`);
    console.log(`   Email:    ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role:     student\n`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error(`❌ Failed to create auth account: ${msg}`);
    process.exit(1);
  }

  process.exit(0);
}

// ─── CLI ────────────────────────────────────────────────────────────────────────

const uanArg = process.argv[2];
const passwordArg = process.argv[3]; // optional

if (!uanArg) {
  console.log("Usage: bun run script/add-user.ts <uan_number> [password]");
  console.log("");
  console.log("  uan_number  UAN of an existing admitted student (e.g. PPUP00072)");
  console.log("  password    Optional. If omitted, auto-generates from name + aadhar/uan");
  process.exit(1);
}

addUser(uanArg, passwordArg || undefined);
