import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { courseSessionTable, courseTable, departmentTable, semesterTable } from "./department";

// Enrolled Students 
export const EnrolledStudentTable = pgTable('enrolled_students', {
  id: varchar({ length: 128 }).primaryKey().$defaultFn(() => createId()),
  UAN: varchar({ length: 128 }).unique().notNull(),
  universityRoll: varchar({ length: 128 }),
  name: varchar({ length: 150 }).notNull(),
  gender: varchar({ length: 15 }).notNull(),
  batchId: varchar({ length: 128 }).references(() => courseSessionTable.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
},
  (table) => [
    check(
      "gender_check",
      sql`${table.gender} IN ('Male', 'Female', 'Transgender')`,
    ),
  ],
)


// Admitted Students 
export const AdmittedStudentTable = pgTable('admitted_students', {
  id: varchar({ length: 128 }).primaryKey().$defaultFn(() => createId()),
  UAN: varchar({ length: 128 }).unique().notNull(),
  registrationNumber: varchar({ length: 128 }),
  universityRoll: varchar({ length: 128 }),
  collegeRoll: varchar({ length: 128 }).unique(), // Ex. SSDC UG 202629 123 (College Name, Course Type, Session, Unique No.)
  admissionNo: varchar({ length: 128 }).unique(),
  confidentialNo: varchar({ length: 128 }).unique(),
  meritType: text(),
  profileNo: varchar({ length: 128 }).unique(),
  name: varchar({ length: 150 }).notNull(),
  avatar: text().default(''),
  DOB: date().notNull(),
  AadharNumber: varchar({ length: 12 }).notNull().unique(),
  gender: varchar({ length: 15 }).notNull(),
  fathersName: varchar({ length: 50 }).notNull(),
  mothersName: varchar({ length: 50 }).notNull(),
  religion: varchar({ length: 50 }).notNull(),
  caste: varchar({ length: 50 }).notNull(),
  isMinority: boolean().default(false),
  currentSemesterCount: integer().notNull().default(1),
  currentSemesterId: varchar({ length: 128 }).references(() => semesterTable.id, { onDelete: 'cascade' }).notNull(),
  isProfileCompleted: boolean().notNull().default(false),
  isDetained: boolean().notNull().default(false),
  isActive: boolean().notNull().default(true),
  detainRemark: text().default(''),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
},
  (table) => [
    check(
      "gender_check",
      sql`${table.gender} IN ('Male', 'Female', 'Transgender')`,
    ),
    check(
      'meritType_check',
      sql`${table.meritType} IN ('1st', '2nd', '3rd', 'Sports Merit', 'Tribe Reserved', 'Other')`,
    ),
  ],
)

export const StudentPreviousAcademicRecordTable = pgTable('student_previous_academic_record', {
  id: varchar({ length: 128 }).primaryKey().$defaultFn(() => createId()),
  studentId: varchar({ length: 128 }).references(() => AdmittedStudentTable.id, { onDelete: 'cascade' }).notNull(),

  // Secondary School Records
  // SSName: text().notNull(),
  // SSBoard: text().notNull(),
  // SSMarks: integer().notNull(),
  // SSPercentage: integer().notNull(),
  // SSRollNo: varchar({ length: 128 }).notNull().unique(),
  // SSRollCode: varchar({ length: 128 }).unique(),
  // SSAddress: text().notNull(),
  // SSCity: text().notNull(),
  // SSDist: text().notNull(),
  // SSState: text().notNull(),
  // SSPIN: text().notNull(),

  // Higher Secondary School Records
  schoolName: text(),
  board: text(),
  obtainedMarks: integer(),
  totalMarks: integer(),
  percentage: integer(),
  rollNo: varchar({ length: 128 }),
  rollCode: varchar({length: 128}),
  address: text(),
  city: text(),
  district: text(),
  state: text(),
  pin: text(),

  // UG Records 
  ugInstituteName: text(),
  ugUniversityName: text(),
  ugObtainedMarks: integer(),
  ugTotalMarks: integer(),
  ugPercentage: integer(),
  ugRollNo: varchar({ length: 128 }),
  ugAddress: text(),
  ugCity: text(),
  ugDistrict: text(),
  ugState: text(),
  ugPin: text(),
})


export const StudentDocumentsTable = pgTable('student_documents', {
  id: varchar({ length: 128 }).primaryKey().$defaultFn(() => createId()),
  studentId: varchar({ length: 128 }).references(() => AdmittedStudentTable.id, { onDelete: 'cascade' }).notNull(),
  Aadhar: text(),
  cast: text(),
  domicile: text(),
  income: text(),
  pwd: text(), // Person with Disability
  previousLC: text(),
  previousMigration: text(),
  previousMarksheet: text(),
  photo: text(),
  signature: text(),
  currentCourseMarkSheets: jsonb().$type<string[]>().default([]),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
})



export const StudentFeePaymentTable = pgTable('student_fee_payment', {
  id: varchar({ length: 128 }).primaryKey().$defaultFn(() => createId()),
  studentId: varchar({ length: 128 }).references(() => AdmittedStudentTable.id, { onDelete: 'cascade' }).notNull(),
  semesterId: varchar({ length: 128 }).references(() => semesterTable.id, { onDelete: 'cascade' }).notNull(),
  amount: integer().notNull().default(0),
  paymentMode: varchar({ length: 30 }).notNull().default('UPI'),
  transactionId: varchar({ length: 255 }).notNull(),
  status: varchar({ length: 30 }).notNull().default('Pending'),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
})


// Addionational table for Remarks for the student (handle by admin)
export const StudentRemarkTable = pgTable('student_remark', {
  id: varchar({ length: 128 }).primaryKey().$defaultFn(() => createId()),
  studentId: varchar({ length: 128 }).references(() => AdmittedStudentTable.id, { onDelete: 'cascade' }).notNull(),
  remarkBy: varchar({ length: 128 }).notNull(), // Admin/Super Admin User ID
  remarkType: varchar({ length: 30 }).notNull().default('Other'), // Academic, Attendance, Discipline, Other
  remark: text().notNull(),
  importance: text().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
},
  (table) => [
    check(
      "remarkType_check",
      sql`${table.remarkType} IN ('Academic', 'Attendance', 'Discipline', 'Other')`,
    ),
    check(
      "importance_check",
      sql`${table.importance} IN ('Low', 'Medium', 'High', 'Critical')`,
    ),
  ],)