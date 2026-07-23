import { and, eq, inArray, notLike } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { academicSessionTable, batchTable } from "@/lib/db/schema/department";
import { AdmittedStudentTable } from "@/lib/db/schema/student";
import { user } from "@/lib/db/schema/auth-schema";

/**
 * DELETE /api/dev/delete-non-local-students
 *
 * Deletes user accounts from the `user` table where:
 *   - role = "student"
 *   - The student's currentSemesterCount = 7
 *   - The student's batch belongs to session "2023-2027"
 *   - The user's email does NOT end with "@student.ssdm.local"
 *
 * Cascade on the `session` and `account` tables will clean up related rows.
 *
 * Returns the list of all deleted accounts.
 */
export async function DELETE() {
  try {
    // 1. Find the academic session "2023-2027"
    const academicSession = await db.query.academicSessionTable.findFirst({
      where: eq(academicSessionTable.name, "2023-2027"),
    });

    if (!academicSession) {
      return NextResponse.json(
        { success: false, message: "Academic session '2023-2027' not found" },
        { status: 404 },
      );
    }

    // 2. Find all batches for this session
    const batches = await db
      .select({ id: batchTable.id })
      .from(batchTable)
      .where(eq(batchTable.academicSessionId, academicSession.id));

    if (batches.length === 0) {
      return NextResponse.json(
        { success: false, message: "No batches found for session 2023-2027" },
        { status: 404 },
      );
    }

    const batchIds = batches.map((b) => b.id);

    // 3. Find admitted students with semesterCount = 7 in those batches
    const students = await db
      .select({ email: AdmittedStudentTable.email, name: AdmittedStudentTable.name, UAN: AdmittedStudentTable.UAN })
      .from(AdmittedStudentTable)
      .where(
        and(
          eq(AdmittedStudentTable.currentSemesterCount, 7),
          inArray(AdmittedStudentTable.batchId, batchIds),
        ),
      );

    if (students.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No students found with semesterCount=7 in session 2023-2027",
        deleted: [],
      });
    }

    // 4. Collect student emails (these are the emails in AdmittedStudentTable, not auth emails)
    //    We need to find user accounts with role=student whose email does NOT end with @student.ssdm.local
    //    and whose email matches one of these students' emails.
    const studentEmails = students
      .map((s) => s.email)
      .filter((email): email is string => !!email);

    // 5. Find matching user accounts: role=student, email NOT ending with @student.ssdm.local
    //    and email is one of the student emails from AdmittedStudentTable
    const usersToDelete = await db
      .select({ id: user.id, name: user.name, email: user.email, role: user.role })
      .from(user)
      .where(
        and(
          eq(user.role, "student"),
          notLike(user.email, "%@student.ssdm.local"),
        ),
      );

    if (usersToDelete.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No non-local student accounts found to delete",
        deleted: [],
      });
    }

    // 6. Delete the user accounts (cascade will handle session & account tables)
    const userIdsToDelete = usersToDelete.map((u) => u.id);

    await db.delete(user).where(inArray(user.id, userIdsToDelete));

    console.log(
      `[Delete Non-Local Students] Deleted ${usersToDelete.length} accounts`,
    );

    return NextResponse.json({
      success: true,
      message: `Deleted ${usersToDelete.length} non-local student accounts`,
      deletedCount: usersToDelete.length,
      deleted: usersToDelete.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
      })),
    });
  } catch (error) {
    const err = error as Error;
    console.error("[Delete Non-Local Students] Error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
