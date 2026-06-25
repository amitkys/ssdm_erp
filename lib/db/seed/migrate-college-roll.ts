/**
 * One-time migration script to update existing admitted students'
 * collegeRoll to the new format: <YY><courseCode><NNN>
 *
 * e.g. 2607001 (26 = year, 07 = course code, 001 = serial in batch)
 *
 * Usage: bun run lib/db/seed/migrate-college-roll.ts
 */

import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { batchTable } from "@/lib/db/schema/department";
import { AdmittedStudentTable } from "@/lib/db/schema/student";

async function main() {
  console.log("🔄 Starting college roll migration...\n");

  const currentYear = new Date().getFullYear().toString().slice(-2);

  // 1. Get all distinct batchIds that have admitted students
  const allStudents = await db
    .select({
      id: AdmittedStudentTable.id,
      batchId: AdmittedStudentTable.batchId,
      collegeRoll: AdmittedStudentTable.collegeRoll,
      createdAt: AdmittedStudentTable.createdAt,
    })
    .from(AdmittedStudentTable)
    .orderBy(asc(AdmittedStudentTable.createdAt));

  const batchIds = [...new Set(allStudents.map((s) => s.batchId))];

  console.log(
    `Found ${allStudents.length} students across ${batchIds.length} batches\n`,
  );

  let totalUpdated = 0;

  for (const batchId of batchIds) {
    // 2. Fetch batch with course to get course code
    const batch = await db.query.batchTable.findFirst({
      where: eq(batchTable.id, batchId),
      with: { course: true },
    });

    if (!batch || !batch.course) {
      console.warn(
        `⚠️  Skipping batchId=${batchId} — batch or course not found`,
      );
      continue;
    }

    const courseCode = batch.course.code;

    // 3. Get students in this batch ordered by createdAt
    const batchStudents = allStudents
      .filter((s) => s.batchId === batchId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    console.log(
      `📚 Batch: ${batchId} | Course: ${batch.course.name} (${courseCode}) | Students: ${batchStudents.length}`,
    );

    // 4. Update each student's college roll sequentially
    for (let i = 0; i < batchStudents.length; i++) {
      const student = batchStudents[i];
      const serialNumber = (i + 1).toString().padStart(3, "0");
      const newCollegeRoll = `${currentYear}${courseCode}${serialNumber}`;

      if (student.collegeRoll === newCollegeRoll) {
        console.log(
          `   ✅ ${student.id} — already ${newCollegeRoll}, skipping`,
        );
        continue;
      }

      await db
        .update(AdmittedStudentTable)
        .set({ collegeRoll: newCollegeRoll })
        .where(eq(AdmittedStudentTable.id, student.id));

      console.log(
        `   🔁 ${student.id} — ${student.collegeRoll} → ${newCollegeRoll}`,
      );
      totalUpdated++;
    }
  }

  console.log(`\n✅ Migration complete! Updated ${totalUpdated} records.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
