import { faker } from "@faker-js/faker";
import { db } from "@/lib/db"; // Adjust path to your database connection file
import {
  academicSessionTable,
  departmentTable,
  subjectTable,
  courseTable,
  batchTable,
} from "@/lib/db/schema"; // Adjust path to your schema definitions

// --- DEPARTMENTS POOL: Names kept under 30 characters strictly ---
const DEPARTMENTS = [
  { code: "PHYS", name: "Dept of Physics", description: "Classical mechanics, quantum dynamics, and astrophysics labs." },
  { code: "CHEM", name: "Dept of Chemistry", description: "Organic synthesis, physical chemistry, and material sciences." },
  { code: "MATH", name: "Dept of Mathematics", description: "Pure logic, advanced calculus, linear algebra, and topological studies." },
  { code: "COMP", name: "Dept of Computer Apps", description: "Full-stack development, software engineering, and database systems." },
  { code: "COMM", name: "Dept of Commerce", description: "Corporate accounting, financial management, tax laws, and market auditing." },
];

const SUBJECTS_POOL = [
  { code: "PHY-MJC1", name: "Mathematical Physics & Mechanics", category: "SCIENCE", hasPractical: true, fee: 600 },
  { code: "PHY-MJC2", name: "Electricity, Magnetism & Wave Optics", category: "SCIENCE", hasPractical: true, fee: 600 },
  { code: "PHY-MIC1", name: "Introductory General Physics", category: "SCIENCE", hasPractical: false, fee: 0 },
  { code: "CHM-MJC1", name: "Basic Organic & Inorganic Principles", category: "SCIENCE", hasPractical: true, fee: 800 },
  { code: "CHM-MJC2", name: "Physical Chemistry & Thermodynamics", category: "SCIENCE", hasPractical: true, fee: 800 },
  { code: "CHM-MIC1", name: "General Chemistry Essentials", category: "SCIENCE", hasPractical: false, fee: 0 },
  { code: "MAT-MJC1", name: "Calculus & Analytical Geometry", category: "SCIENCE", hasPractical: false, fee: 0 },
  { code: "MAT-MJC2", name: "Real Analysis & Linear Algebra", category: "SCIENCE", hasPractical: false, fee: 0 },
  { code: "MAT-MIC1", name: "Foundational Business Mathematics", category: "COMMERCE", hasPractical: false, fee: 0 },
  { code: "BCA-MJC1", name: "Object-Oriented Programming via C++", category: "SCIENCE", hasPractical: true, fee: 1000 },
  { code: "BCA-MJC2", name: "Database Management Systems & SQL", category: "SCIENCE", hasPractical: true, fee: 1000 },
  { code: "BCA-MIC1", name: "Fundamentals of IT & Office Tools", category: "SCIENCE", hasPractical: false, fee: 0 },
  { code: "COM-MJC1", name: "Financial Accounting Standards", category: "COMMERCE", hasPractical: false, fee: 0 },
  { code: "COM-MJC2", name: "Business Organization & Management", category: "COMMERCE", hasPractical: false, fee: 0 },
  { code: "COM-MIC1", name: "General Principles of Microeconomics", category: "COMMERCE", hasPractical: false, fee: 0 },
  { code: "ENG-MJC1", name: "Introduction to European Classical Literature", category: "ARTS", hasPractical: false, fee: 0 },
  { code: "ENG-MJC2", name: "Indian Classical Literature in Translation", category: "ARTS", hasPractical: false, fee: 0 },
  { code: "ENG-MIC1", name: "Academic Writing and Rhetoric", category: "ARTS", hasPractical: false, fee: 0 },
  { code: "SCI-MDC1", name: "Introduction to Data Science", category: "SCIENCE", hasPractical: true, fee: 500 },
  { code: "BUS-MDC1", name: "Entrepreneurship & Startup Dynamics", category: "COMMERCE", hasPractical: false, fee: 0 },
  { code: "HUM-MDC1", name: "Media Communication & Journalism", category: "ARTS", hasPractical: false, fee: 0 },
  { code: "GEN-SEC1", name: "Advanced Web Styling & UI Design", category: "SCIENCE", hasPractical: true, fee: 400 },
  { code: "GEN-SEC2", name: "Digital Marketing Frameworks", category: "COMMERCE", hasPractical: false, fee: 0 },
  { code: "GEN-VAC1", name: "Environmental Studies & Eco-Systems", category: "SCIENCE", hasPractical: false, fee: 0 },
  { code: "GEN-VAC2", name: "Ethics, Culture & Human Values", category: "ARTS", hasPractical: false, fee: 0 },
];

const COURSES_POOL = [
  { deptCode: "PHYS", code: "BSC-PHYS", name: "B.Sc (Honors) Physics", type: "UG Regular", duration: 4, description: "Four-year undergraduate physics framework focusing on mechanics and theory.", perSemesterFee: 22000 },
  { deptCode: "CHEM", code: "BSC-CHEM", name: "B.Sc (Honors) Chemistry", type: "UG Regular", duration: 4, description: "Rigorous organic, inorganic, and physical laboratory chemical program.", perSemesterFee: 24000 },
  { deptCode: "MATH", code: "BSC-MATH", name: "B.Sc (Honors) Mathematics", type: "UG Regular", duration: 4, description: "Focuses on pure theory, geometry, metrics, and complex algorithms.", perSemesterFee: 12000 },
  { deptCode: "COMP", code: "BCA", name: "Bachelor of Computer Applications", type: "UG Vocational", duration: 3, description: "Three-year applied training framework mapping software, MERN, and networks.", perSemesterFee: 30000 },
  { deptCode: "COMP", code: "MCA", name: "Master of Computer Applications", type: "PG Regular", duration: 2, description: "Two-year postgraduate tier evaluating advanced microservices and computing.", perSemesterFee: 35000 },
  { deptCode: "COMM", code: "BCOM-H", name: "B.Com (Honors) Accounting", type: "UG Regular", duration: 4, description: "Comprehensive management track focusing on calculations and audits.", perSemesterFee: 10000 },
];

<<<<<<< HEAD
const ROMAN_NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

export async function seedDepartments() {
=======
async function main() {
>>>>>>> feature/update
  const suffix = faker.string.alphanumeric(2).toUpperCase();
  console.log(`🧹 Running department seeding (Suffix: ${suffix})...`);

<<<<<<< HEAD
  // 1. Seed Academic Sessions (Format: "2024-2028")
  console.log("🌱 Seeding Academic Sessions...");
  const sessionData = [
    { startYear: 2024, duration: 4 },
    { startYear: 2025, duration: 4 },
    { startYear: 2026, duration: 4 },
  ].map(({ startYear, duration }) => {
    const endYear = startYear + duration;
    return {
      name: `${startYear}-${endYear}-${suffix}`, // Fits under the varchar(30) limit
      startDate: `${startYear}-07-01`,
      endDate: `${endYear}-06-30`,
    };
  });
=======
  try {
    // 1. Seed Academic Sessions (Format: "2024-2028")
    console.log("🌱 Seeding Academic Sessions...");
    const sessionData = [
      { startYear: 2024, duration: 4 },
      { startYear: 2025, duration: 4 },
      { startYear: 2026, duration: 4 },
    ].map(({ startYear, duration }) => {
      const endYear = startYear + duration;
      return {
        name: `${startYear}-${endYear}-${suffix}`, // Fits under the varchar(30) limit
        startDate: `${startYear}-07-01`,
        endDate: `${endYear}-06-30`,
      };
    });
>>>>>>> feature/update

  const insertedSessions = await db
    .insert(academicSessionTable)
    .values(sessionData)
    .returning({ id: academicSessionTable.id, name: academicSessionTable.name });

<<<<<<< HEAD
  // 2. Seed Departments
  console.log("🌱 Seeding Departments...");
  const insertedDepts = await db
    .insert(departmentTable)
    .values(DEPARTMENTS.map(d => ({ ...d, code: `${d.code}-${suffix}`.slice(0, 10), name: `${d.name} ${suffix}`.slice(0, 30) })))
    .returning({ id: departmentTable.id, code: departmentTable.code });

  // 3. Seed Subjects
  console.log("🌱 Seeding Subjects...");
  const finalSubjects = await db
    .insert(subjectTable)
    .values(
      SUBJECTS_POOL.map((sub) => ({
        code: `${sub.code}${suffix}`.slice(0, 10),
        name: `${sub.name} ${suffix}`.slice(0, 100),
        description: `Syllabus coursework for ${sub.name}.`,
        type: sub.type,
        hasPractical: sub.hasPractical,
        practicalFee: sub.fee,
      }))
    )
    .returning({ id: subjectTable.id, code: subjectTable.code, type: subjectTable.type });

  // 4. Seed Courses (Linking via departmentId)
  console.log("🌱 Seeding Higher Education Courses...");
  const courseInsertValues = COURSES_POOL.map((c) => {
    const targetDeptCode = `${c.deptCode}-${suffix}`.slice(0, 10);
    const dept = insertedDepts.find((d) => d.code === targetDeptCode);
    if (!dept) throw new Error(`Department with code ${targetDeptCode} not found during seeding runtime.`);
    return {
      name: `${c.name} ${suffix}`.slice(0, 50),
      code: `${c.code}-${suffix}`.slice(0, 10),
      type: c.type,
      description: c.description,
      departmentId: dept.id,
      duration: c.duration,
    };
  });
=======
    // 2. Seed Departments
    console.log("🌱 Seeding Departments...");
    const insertedDepts = await db
      .insert(departmentTable)
      .values(DEPARTMENTS.map(d => ({ ...d, code: `${d.code}-${suffix}`.slice(0, 10), name: `${d.name} ${suffix}`.slice(0, 30) })))
      .returning({ id: departmentTable.id, code: departmentTable.code });

    // 3. Seed Subjects
    console.log("🌱 Seeding Subjects...");
    await db
      .insert(subjectTable)
      .values(
        SUBJECTS_POOL.map((sub) => ({
          code: `${sub.code}${suffix}`.slice(0, 10),
          name: `${sub.name} ${suffix}`.slice(0, 100),
          description: `Syllabus coursework for ${sub.name}.`,
          category: sub.category,
          hasPractical: sub.hasPractical,
          practicalFee: sub.fee,
        }))
      );

    // 4. Seed Courses (Linking via departmentId)
    console.log("🌱 Seeding Higher Education Courses...");
    const courseInsertValues = COURSES_POOL.map((c) => {
      const targetDeptCode = `${c.deptCode}-${suffix}`.slice(0, 10);
      const dept = insertedDepts.find((d) => d.code === targetDeptCode);
      if (!dept) throw new Error(`Department with code ${targetDeptCode} not found during seeding runtime.`);
      return {
        name: `${c.name} ${suffix}`.slice(0, 50),
        code: `${c.code}-${suffix}`.slice(0, 10),
        type: c.type,
        description: c.description,
        departmentId: dept.id,
        duration: c.duration,
      };
    });
>>>>>>> feature/update

  const finalCourses = await db
    .insert(courseTable)
    .values(courseInsertValues)
    .returning({ id: courseTable.id, code: courseTable.code, duration: courseTable.duration });

<<<<<<< HEAD
  // 5. Seed Course Sessions Junction Table
  console.log("🌱 Constructing Course-Session mappings...");
  const courseSessionData = [];

  for (const course of finalCourses) {
    for (const session of insertedSessions) {
      courseSessionData.push({
        courseId: course.id,
        sessionId: session.id,
      });
=======
    // 5. Seed Batches (Course + Session combinations with per-semester fee)
    console.log("🌱 Seeding Batches...");

    const batchInsertValues: {
      courseId: string;
      sessionId: string;
      perSemesterFee: number;
    }[] = [];

    for (const course of finalCourses) {
      // Find the matching course pool entry for per-semester fee
      const poolEntry = COURSES_POOL.find(
        (c) => `${c.code}-${suffix}`.slice(0, 10) === course.code
      );
      const baseFee = poolEntry?.perSemesterFee ?? 15000;

      for (const session of insertedSessions) {
        batchInsertValues.push({
          courseId: course.id,
          sessionId: session.id,
          perSemesterFee: baseFee + faker.number.int({ min: -2000, max: 3000 }),
        });
      }
>>>>>>> feature/update
    }
  }

<<<<<<< HEAD
  const finalCourseSessions = await db
    .insert(courseSessionTable)
    .values(courseSessionData)
    .returning({ id: courseSessionTable.id, courseId: courseSessionTable.courseId, sessionId: courseSessionTable.sessionId });

  // 6. Deep Cascaded Loop Setup (Batches, Semesters, Fees, and Subjects)
  console.log("🌱 Executing deep relational cascade setup...");

  for (const cs of finalCourseSessions) {
    const parentCourse = finalCourses.find((c) => c.id === cs.courseId);
    const parentSession = insertedSessions.find((s) => s.id === cs.sessionId);
    if (!parentCourse || !parentSession) continue;

    // Seed Batches (Automatically naming e.g., "BCA (2024-2028)")
    // Slicing at 30 characters maximum to respect batchTable.name length constraint!
    const batchName = `${parentCourse.code} (${parentSession.name})`.slice(0, 30);
    await db.insert(batchTable).values({
      courseSessionId: cs.id,
      name: batchName,
    });

    // Compute total semesters (duration * 2)
    const totalSemesters = parentCourse.duration * 2;

    for (let semNum = 1; semNum <= totalSemesters; semNum++) {
      const roman = ROMAN_NUMERALS[(semNum - 1) % ROMAN_NUMERALS.length] || semNum.toString();
      
      // Seed Semesters (e.g., "Semester I")
      const [insertedSemester] = await db
        .insert(semesterTable)
        .values({
          courseSessionId: cs.id,
          name: `Semester ${roman}`,
          semesterNumber: semNum,
        })
        .returning({ id: semesterTable.id });

      // Seed Associated Structural Fees tailored by program stream 
      const isTechOrScience = ["BCA", "MCA", "BSC-PHYS", "BSC-CHEM"].includes(parentCourse.code);
      await db.insert(feeTable).values({
        semesterId: insertedSemester.id,
        institution: isTechOrScience ? faker.number.int({ min: 18000, max: 26000 }) : faker.number.int({ min: 8000, max: 14000 }),
        university: faker.number.int({ min: 2000, max: 4000 }),
        late: 300,
        practical: isTechOrScience ? 1500 : 0,
        cultural: 250,
        sports: 250,
        miscellaneous: 500,
      });

      // --- Realistic Subject Assignment Business Logic ---
      const targetedSubjectIds: string[] = [];
      const coursePrefix = parentCourse.code.includes("-") ? parentCourse.code.split("-")[1] : parentCourse.code;
      const prefixMatch = coursePrefix.slice(0, 3); // e.g., "PHY", "BCA", "CHE"

      // 1. Core Paper (MJC) -> Matches the stream prefix
      const corePaper = finalSubjects.find((s) => s.type === "MJC" && s.code.startsWith(prefixMatch));
      if (corePaper) targetedSubjectIds.push(corePaper.id);

      // 2. Subsidiary Paper (MIC) -> Separate elective domain
      const subsidiaryPaper = finalSubjects.find((s) => s.type === "MIC" && !s.code.startsWith(prefixMatch));
      if (subsidiaryPaper) targetedSubjectIds.push(subsidiaryPaper.id);

      // 3. Multi-Disciplinary (MDC) -> Elective course
      const mdcPaper = finalSubjects.find((s) => s.type === "MDC" && !s.code.startsWith(prefixMatch));
      if (mdcPaper) targetedSubjectIds.push(mdcPaper.id);

      // 4. Common Skill Competency / Values (SEC / VAC)
      const skillPaper = finalSubjects.find((s) => s.type === "SEC" || s.type === "VAC");
      if (skillPaper) targetedSubjectIds.push(skillPaper.id);

      // Map arrays into the semester-subject junction table
      const semesterSubjectEntries = targetedSubjectIds.map((subId) => ({
        semesterId: insertedSemester.id,
        subjectId: subId,
      }));

      if (semesterSubjectEntries.length > 0) {
        // Filter duplicates before firing execution query
        const uniqueEntries = Array.from(new Map(semesterSubjectEntries.map(item => [item.subjectId, item])).values());
        await db.insert(semesterSubjectTable).values(uniqueEntries);
      }
    }
=======
    await db.insert(batchTable).values(batchInsertValues);

    console.log("🎉 Database successfully hydrated with fresh college data configuration!");
  } catch (error) {
    console.error("❌ Seeding execution failed:", error);
    process.exit(1);
>>>>>>> feature/update
  }

  console.log("🎉 Department seeding completed successfully!");
}

// Allow standalone execution
seedDepartments();