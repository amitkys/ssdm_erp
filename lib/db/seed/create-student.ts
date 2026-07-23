import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  academicSessionTable,
  batchTable,
  courseTable,
  departmentTable,
  subjectTable,
} from "@/lib/db/schema/department";
import { AdmittedStudentTable } from "@/lib/db/schema/student";
import { eq } from "drizzle-orm";
import { fakerEN_IN as faker } from "@faker-js/faker";

async function main() {
  console.log("🌱 Starting student seeding script...");

  // 1. Ensure we have an Academic Session
  let session = await db.query.academicSessionTable.findFirst();
  if (!session) {
    console.log("⚠️ No academic session found, creating one...");
    const [newSession] = await db
      .insert(academicSessionTable)
      .values({
        name: "2026-2030",
        startDate: "2026-07-01",
        endDate: "2030-06-30",
      })
      .returning();
    session = newSession;
  }
  console.log(`Using Academic Session: ${session.name} (ID: ${session.id})`);

  // 2. Ensure we have a Department
  let dept = await db.query.departmentTable.findFirst({
    where: eq(departmentTable.code, "COMP"),
  });
  if (!dept) {
    dept = await db.query.departmentTable.findFirst();
  }
  if (!dept) {
    console.log("⚠️ No department found, creating one...");
    const [newDept] = await db
      .insert(departmentTable)
      .values({
        code: "COMP",
        name: "Computer Applications",
        description: "Department of Computer Applications",
      })
      .returning();
    dept = newDept;
  }
  console.log(`Using Department: ${dept.code} (ID: ${dept.id})`);

  // 3. Ensure we have a Course
  let course = await db.query.courseTable.findFirst({
    where: eq(courseTable.code, `BSC-${dept.code}`),
  });
  if (!course) {
    course = await db.query.courseTable.findFirst();
  }
  if (!course) {
    console.log("⚠️ No course found, creating one...");
    const [newCourse] = await db
      .insert(courseTable)
      .values({
        name: `B.Sc in ${dept.name}`,
        code: `BSC-${dept.code}`,
        type: "UG Regular",
        departmentId: dept.id,
        duration: 4,
      })
      .returning();
    course = newCourse;
  }
  console.log(`Using Course: ${course.code} (ID: ${course.id})`);

  // 4. Ensure we have a Batch
  let batch = await db.query.batchTable.findFirst({
    where: eq(batchTable.courseId, course.id),
  });
  if (!batch) {
    console.log("⚠️ No batch found for this course, creating one...");
    const [newBatch] = await db
      .insert(batchTable)
      .values({
        courseId: course.id,
        academicSessionId: session.id,
        perSemesterFee: 5000,
        isActive: true,
      })
      .returning();
    batch = newBatch;
  }
  console.log(`Using Batch ID: ${batch.id}`);

  // 5. Ensure we have an MJC Subject
  let mjcSubject = await db.query.subjectTable.findFirst({
    where: eq(subjectTable.category, "SCIENCE"),
  });
  if (!mjcSubject) {
    console.log("⚠️ No subject found, creating one...");
    const [newSubject] = await db
      .insert(subjectTable)
      .values({
        code: "BCA-MJC1",
        name: "MJC of BCA",
        category: "SCIENCE",
        hasPractical: true,
        practicalFee: 500,
      })
      .returning();
    mjcSubject = newSubject;
  }
  console.log(`Using MJC Subject: ${mjcSubject.code} (ID: ${mjcSubject.id})`);

  // 6. Create Student user account using Better Auth API
  const studentEmail = "student@example.com";
  const studentPassword = "password123";
  const studentName = "Test Student";

  try {
    const signupResponse = await auth.api.signUpEmail({
      body: {
        name: studentName,
        email: studentEmail,
        password: studentPassword,
        role: "student",
      },
    });
    if (signupResponse) {
      console.log(
        `✅ Better Auth user account created successfully for: ${studentEmail}`,
      );
    }
  } catch (error: any) {
    if (
      error?.message?.includes("already exists") ||
      error?.body?.message?.includes("already exists")
    ) {
      console.log(
        `ℹ️ Better Auth user account with email ${studentEmail} already exists.`,
      );
    } else {
      console.error("❌ Error registering student user:", error);
    }
  }

  // 7. Ensure Admitted Student Record
  let admittedStudent = await db.query.AdmittedStudentTable.findFirst({
    where: eq(AdmittedStudentTable.email, studentEmail),
  });

  if (!admittedStudent) {
    console.log("🌱 Creating admitted student record for matching email...");
    const sessionStartYear = Number(session.startDate.slice(0, 4));
    const randomSuffix = faker.string.numeric(6);

    const [newAdmitted] = await db
      .insert(AdmittedStudentTable)
      .values({
        UAN: `UAN-${sessionStartYear}-${randomSuffix}`,
        registrationNumber: `REG-${faker.string.numeric(10)}`,
        universityRoll: `UR-${faker.string.numeric(8)}`,
        collegeRoll: `UG${String(sessionStartYear).slice(-2)}${faker.string.numeric(4)}`,
        admissionNumber: `ADM-${sessionStartYear}-${faker.string.numeric(4)}`,
        confidentialNumber: `CONF-${faker.string.numeric(8)}`,
        profileNumber: `PRF-${randomSuffix}`,
        admissionType: "MERIT",
        ABCID: `ABC-${faker.string.numeric(12)}`,
        name: studentName,
        DOB: "2005-01-01",
        AadharNumber: faker.string.numeric(12),
        phone: faker.string.numeric(10),
        email: studentEmail,
        gender: "Male",
        fathersName: faker.person.fullName(),
        mothersName: faker.person.fullName(),
        religion: "Hindu",
        caste: "GEN",
        batchId: batch.id,
        currentSemesterCount: 1,
        subMJC: mjcSubject.id,
        city: faker.location.city(),
        district: faker.location.county(),
        state: faker.location.state(),
        pinCode: Number.parseInt(
          faker.string.numeric({ length: 6, allowLeadingZeros: false }),
        ),
        isProfileCompleted: true,
        isActive: true,
      })
      .returning();
    admittedStudent = newAdmitted;
    console.log(
      `✅ Admitted student profile created (ID: ${admittedStudent.id})`,
    );
  } else {
    console.log(
      `ℹ️ Admitted student profile already exists (ID: ${admittedStudent.id})`,
    );
    // Ensure batchId, subMJC, currentSemesterCount, and active fields are valid if it already exists
    await db
      .update(AdmittedStudentTable)
      .set({
        batchId: batch.id,
        subMJC: mjcSubject.id,
        currentSemesterCount: 1, // Reset to semester 1 for test repeatability
        isActive: true,
        isProfileCompleted: true,
      })
      .where(eq(AdmittedStudentTable.id, admittedStudent.id));
    console.log(
      `🔄 Reset student's currentSemesterCount to 1 and linked to active batch.`,
    );
  }

  console.log("\n🎉 Student seeding completed successfully!");
  console.log("-----------------------------------------");
  console.log(`Email: ${studentEmail}`);
  console.log(`Password: ${studentPassword}`);
  console.log("-----------------------------------------");
  process.exit(0);
}

main().catch((error) => {
  console.error("❌ Seeding script failed:", error);
  process.exit(1);
});
