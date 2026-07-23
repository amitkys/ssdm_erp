import { fakerEN_IN as faker } from "@faker-js/faker";
import { db } from "@/lib/db";
import {
  StudentFeePaymentTable,
  AdmittedStudentTable,
  batchTable,
  courseTable,
  subjectTable,
} from "@/lib/db/schema";
import { createId } from "@paralleldrive/cuid2";

async function main() {
  console.log("🌱 Seeding test database records for DCR validation...");

  try {
    // 1. Fetch prerequisites
    const batches = await db.select().from(batchTable);
    const subjects = await db.select().from(subjectTable);

    if (batches.length === 0 || subjects.length === 0) {
      console.error("❌ Pre-requisites not met. Please seed departments and batches first.");
      process.exit(1);
    }

    // Clear previous payments and admitted students to prevent collisions
    await db.delete(StudentFeePaymentTable);
    await db.delete(AdmittedStudentTable);
    console.log("🧹 Cleared old transactions and admitted students.");

    const now = new Date();
    const studentsToInsert = [];
    const paymentsToInsert = [];

    // Helper to pick random element
    const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    const mjcSubjects = subjects.filter(s => s.code.includes("MJC"));

    // We will generate 12 admitted students
    for (let i = 0; i < 12; i++) {
      const studentId = createId();
      const uan = `UAN-${now.getFullYear()}-${String(i + 100).padStart(6, "0")}`;
      const collegeRoll = `UG${now.getFullYear()}${String(i + 1).padStart(4, "0")}`;
      const selectedBatch = pickRandom(batches);
      const selectedSubject = pickRandom(mjcSubjects);

      studentsToInsert.push({
        id: studentId,
        UAN: uan,
        registrationNumber: `REG-${faker.string.numeric(10)}`,
        universityRoll: `UNIV-${faker.string.numeric(10)}`,
        collegeRoll: collegeRoll,
        admissionNumber: `ADM-${faker.string.numeric(6)}`,
        confidentialNumber: `CONF-${faker.string.numeric(6)}`,
        profileNumber: `PROF-${faker.string.numeric(6)}`,
        admissionType: "MERIT",
        ABCID: `ABC-${faker.string.numeric(12)}`,
        name: faker.person.fullName(),
        avatar: "",
        DOB: faker.date.birthdate({ min: 18, max: 24, mode: "age" }).toISOString().split("T")[0],
        AadharNumber: faker.string.numeric(12),
        phone: faker.string.numeric(10),
        email: faker.internet.email().toLowerCase(),
        gender: pickRandom(["Female", "Male"]),
        fathersName: faker.person.fullName(),
        mothersName: faker.person.fullName(),
        religion: "Hinduism",
        caste: "GEN",
        city: faker.location.city(),
        district: faker.location.county(),
        state: "Bihar",
        pinCode: 803213,
        batchId: selectedBatch.id,
        subMJC: selectedSubject.id,
        currentSemesterCount: 1,
      });

      // We will create payment records for each student with different parameters:
      // i = 0, 1, 2: Payments made today (Success, Semester 1)
      // i = 3, 4, 5: Payments made 3 days ago (Success, Semester 1)
      // i = 6, 7: Payments made 40 days ago (Success, Semester 1) - older collection
      // i = 8: Payment made today (Success, Semester 2) - to test semester filtering
      // i = 9: Payment made today (Pending) - should not appear in success collections
      // i = 10: Payment made today (Failed) - should not appear in success collections
      // i = 11: Payment made 5 days ago (Success, Semester 1)
      
      let payDate = new Date();
      let semesterCount = 1;
      let status = "Success";
      let amount = selectedBatch.perSemesterFee;
      let paymentMode = pickRandom(["UPI", "Card", "Net Banking"]);

      if (i >= 3 && i <= 5) {
        payDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3);
      } else if (i === 6 || i === 7) {
        payDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 40);
      } else if (i === 8) {
        semesterCount = 2; // Semester 2
      } else if (i === 9) {
        status = "Pending";
      } else if (i === 10) {
        status = "Failed";
      } else if (i === 11) {
        payDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5);
      }

      paymentsToInsert.push({
        id: createId(),
        studentId: studentId,
        semesterCount: semesterCount,
        amount: amount,
        paymentMode: paymentMode,
        transactionId: `TXN-${payDate.getTime()}-${faker.string.numeric(3)}`,
        status: status,
        createdAt: payDate,
        updatedAt: payDate,
      });
    }

    // Insert Admitted Students
    await db.insert(AdmittedStudentTable).values(studentsToInsert);
    console.log(`✅ Seeded ${studentsToInsert.length} mock admitted students.`);

    // Insert Payments
    await db.insert(StudentFeePaymentTable).values(paymentsToInsert);
    console.log(`✅ Seeded ${paymentsToInsert.length} mock payment transactions.`);

    console.log("🎉 Seeding complete! You can now verify the Admission DCR dashboard.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

main();
