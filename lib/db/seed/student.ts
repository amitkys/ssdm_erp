import { faker } from "@faker-js/faker";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import {
  courseTable,
  courseSessionTable,
  departmentTable,
  semesterTable,
} from "@/lib/db/schema";
import {
  AdmittedStudentTable,
  EnrolledStudentTable,
  StudentDocumentsTable,
  StudentFeePaymentTable,
  StudentPreviousAcademicRecordTable,
  StudentRemarkTable,
} from "../schema/student";

// --- Helpers ---

/** Generate a unique UAN like "UAN-2026-XXXXXX" */
function generateUAN(index: number): string {
  const year = new Date().getFullYear();
  const serial = String(index + 1).padStart(6, "0");
  return `UAN-${year}-${serial}`;
}

/** Pick a random element from an array */
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// --- Data Pools ---

const GENDERS = ["Male", "Female", "Transgender"] as const;
const RELIGIONS = ["Hindu", "Muslim", "Christian", "Sikh", "Buddhist", "Jain"];
const CASTES = ["General", "OBC", "SC", "ST", "EWS"];
const BOARDS = ["CBSE", "ICSE", "State Board", "NIOS"];
const STATES = ["Bihar", "Jharkhand", "Uttar Pradesh", "West Bengal", "Delhi", "Maharashtra"];
const MERIT_TYPES = ["1st", "2nd", "3rd", "Sports Merit", "Tribe Reserved", "Other"] as const;
const REMARK_TYPES = ["Academic", "Attendance", "Discipline", "Other"] as const;
const IMPORTANCE_LEVELS = ["Low", "Medium", "High", "Critical"] as const;
const PAYMENT_MODES = ["UPI", "Cash", "NEFT", "RTGS", "DD"] as const;
const PAYMENT_STATUSES = ["Pending", "Completed", "Failed"] as const;

// --- Student Seed Functions ---

export async function seedStudents() {
  console.log("🧹 Running student seeding...");

  try {
    // 1. Fetch existing department data (prerequisite: department seed must have run)
    const departments = await db.select({ id: departmentTable.id, code: departmentTable.code }).from(departmentTable);
    const courses = await db.select({ id: courseTable.id, code: courseTable.code, departmentId: courseTable.departmentId }).from(courseTable);
    const courseSessions = await db.select({ id: courseSessionTable.id, courseId: courseSessionTable.courseId }).from(courseSessionTable);
    const semesters = await db
      .select({ id: semesterTable.id, courseSessionId: semesterTable.courseSessionId, semesterNumber: semesterTable.semesterNumber })
      .from(semesterTable);

    if (departments.length === 0 || courses.length === 0 || courseSessions.length === 0 || semesters.length === 0) {
      console.error("❌ No department/course/session/semester data found. Please run the department seed first.");
      process.exit(1);
    }

    // 2. Seed Enrolled Students (pre-admission pipeline)
    console.log("🌱 Seeding Enrolled Students...");
    const ENROLLED_COUNT = 30;
    const enrolledValues = [];

    for (let i = 0; i < ENROLLED_COUNT; i++) {
      const course = pickRandom(courses);
      const courseSession = courseSessions.find((cs) => cs.courseId === course.id);
      if (!courseSession) continue;

      enrolledValues.push({
        UAN: generateUAN(i),
        name: faker.person.fullName(),
        gender: pickRandom([...GENDERS]),
        batchId: courseSession.id,
      });
    }

    const insertedEnrolled = await db
      .insert(EnrolledStudentTable)
      .values(enrolledValues)
      .returning({ id: EnrolledStudentTable.id, UAN: EnrolledStudentTable.UAN });

    console.log(`   ✅ Enrolled ${insertedEnrolled.length} students.`);

    // 3. Seed Admitted Students (full profile students)
    console.log("🌱 Seeding Admitted Students...");
    const ADMITTED_COUNT = 20;
    const admittedValues = [];

    for (let i = 0; i < ADMITTED_COUNT; i++) {
      const course = pickRandom(courses);
      const dept = departments.find((d) => d.id === course.departmentId);
      const courseSession = courseSessions.find((cs) => cs.courseId === course.id);
      if (!dept || !courseSession) continue;

      // Find the first semester for this course session
      const firstSemester = semesters.find(
        (s) => s.courseSessionId === courseSession.id && s.semesterNumber === 1
      );
      if (!firstSemester) continue;

      const gender = pickRandom([...GENDERS]);
      const uan = generateUAN(ENROLLED_COUNT + i); // Offset to avoid UAN collision

      admittedValues.push({
        UAN: uan,
        registrationNumber: `REG-${faker.string.alphanumeric(8).toUpperCase()}`,
        universityRoll: `UNIV-${faker.string.numeric(8)}`,
        collegeRoll: `SSDC-${course.code}-${faker.string.numeric(4)}`.slice(0, 128),
        admissionNo: `ADM-${faker.string.alphanumeric(8).toUpperCase()}`,
        confidentialNo: `CONF-${faker.string.numeric(8)}`,
        meritType: pickRandom([...MERIT_TYPES]),
        profileNo: `PROF-${faker.string.alphanumeric(8).toUpperCase()}`,
        name: faker.person.fullName({ sex: gender === "Male" ? "male" : "female" }),
        avatar: "",
        DOB: faker.date.birthdate({ min: 18, max: 25, mode: "age" }).toISOString().split("T")[0],
        AadharNumber: faker.string.numeric(12),
        gender: gender,
        fathersName: faker.person.fullName({ sex: "male" }),
        mothersName: faker.person.fullName({ sex: "female" }),
        religion: pickRandom(RELIGIONS),
        caste: pickRandom(CASTES),
        isMinority: faker.datatype.boolean({ probability: 0.2 }),
        currentSemesterCount: 1,
        currentSemesterId: firstSemester.id,
        isProfileCompleted: faker.datatype.boolean({ probability: 0.7 }),
        isDetained: false,
        isActive: true,
        detainRemark: "",
      });
    }

    const insertedAdmitted = await db
      .insert(AdmittedStudentTable)
      .values(admittedValues)
      .returning({ id: AdmittedStudentTable.id, UAN: AdmittedStudentTable.UAN, currentSemesterId: AdmittedStudentTable.currentSemesterId });

    console.log(`   ✅ Admitted ${insertedAdmitted.length} students.`);

    // 4. Seed Previous Academic Records for each admitted student
    console.log("🌱 Seeding Student Previous Academic Records...");
    const academicRecords = insertedAdmitted.map((student) => {
      const hssObtained = faker.number.int({ min: 200, max: 500 });
      const hssTotal = 500;

      return {
        studentId: student.id,

        // Higher Secondary School Records
        schoolName: `${faker.location.city()} Senior Secondary School`,
        board: pickRandom(BOARDS),
        obtainedMarks: hssObtained,
        totalMarks: hssTotal,
        percentage: Math.round((hssObtained / hssTotal) * 100),
        rollNo: faker.string.numeric(10),
        rollCode: faker.string.alphanumeric(6).toUpperCase(),
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        district: faker.location.city(),
        state: pickRandom(STATES),
        pin: faker.string.numeric(6),

        // UG Records (optional — only for ~30% of students, simulating PG applicants)
        ...(faker.datatype.boolean({ probability: 0.3 })
          ? {
              ugInstituteName: `${faker.location.city()} University`,
              ugUniversityName: `University of ${faker.location.state()}`,
              ugObtainedMarks: faker.number.int({ min: 300, max: 600 }),
              ugTotalMarks: 600,
              ugPercentage: faker.number.int({ min: 50, max: 90 }),
              ugRollNo: faker.string.numeric(10),
              ugAddress: faker.location.streetAddress(),
              ugCity: faker.location.city(),
              ugDistrict: faker.location.city(),
              ugState: pickRandom(STATES),
              ugPin: faker.string.numeric(6),
            }
          : {}),
      };
    });

    await db.insert(StudentPreviousAcademicRecordTable).values(academicRecords);
    console.log(`   ✅ Seeded ${academicRecords.length} previous academic records.`);

    // 5. Seed Student Documents (placeholder entries, no real file URLs)
    console.log("🌱 Seeding Student Documents...");
    const documents = insertedAdmitted.map((student) => ({
      studentId: student.id,
      Aadhar: "",
      cast: "",
      domicile: "",
      income: "",
      pwd: "",
      previousLC: "",
      previousMigration: "",
      previousMarksheet: "",
      photo: "",
      signature: "",
      currentCourseMarkSheets: [] as string[],
    }));

    await db.insert(StudentDocumentsTable).values(documents);
    console.log(`   ✅ Seeded ${documents.length} student document records.`);

    // 6. Seed Student Fee Payments (1-3 payments per student)
    console.log("🌱 Seeding Student Fee Payments...");
    const feePayments = [];

    for (const student of insertedAdmitted) {
      const paymentCount = faker.number.int({ min: 1, max: 3 });

      // Find the semester(s) associated with this student's current semester
      const studentSemester = semesters.find((s) => s.id === student.currentSemesterId);
      if (!studentSemester) continue;

      // Get all semesters for the same courseSession up to current
      const relevantSemesters = semesters.filter(
        (s) => s.courseSessionId === studentSemester.courseSessionId && s.semesterNumber <= studentSemester.semesterNumber
      );

      for (let p = 0; p < Math.min(paymentCount, relevantSemesters.length); p++) {
        feePayments.push({
          studentId: student.id,
          semesterId: relevantSemesters[p].id,
          amount: faker.number.int({ min: 5000, max: 30000 }),
          paymentMode: pickRandom([...PAYMENT_MODES]),
          transactionId: `TXN-${faker.string.alphanumeric(12).toUpperCase()}`,
          status: pickRandom([...PAYMENT_STATUSES]),
        });
      }
    }

    if (feePayments.length > 0) {
      await db.insert(StudentFeePaymentTable).values(feePayments);
    }
    console.log(`   ✅ Seeded ${feePayments.length} fee payment records.`);

    // 7. Seed Student Remarks (random remarks for ~50% of students)
    console.log("🌱 Seeding Student Remarks...");
    const remarks = [];

    for (const student of insertedAdmitted) {
      if (!faker.datatype.boolean({ probability: 0.5 })) continue;

      const remarkCount = faker.number.int({ min: 1, max: 3 });
      for (let r = 0; r < remarkCount; r++) {
        remarks.push({
          studentId: student.id,
          remarkBy: `ADMIN-${faker.string.alphanumeric(6).toUpperCase()}`,
          remarkType: pickRandom([...REMARK_TYPES]),
          remark: faker.lorem.sentence({ min: 5, max: 15 }),
          importance: pickRandom([...IMPORTANCE_LEVELS]),
        });
      }
    }

    if (remarks.length > 0) {
      await db.insert(StudentRemarkTable).values(remarks);
    }
    console.log(`   ✅ Seeded ${remarks.length} student remarks.`);

    console.log("🎉 Student seeding completed successfully!");
  } catch (error) {
    console.error("❌ Student seeding failed:", error);
    process.exit(1);
  }
}

// Allow standalone execution
seedStudents();
