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
  id: varchar({length: 128}).primaryKey().$defaultFn(()=> createId()),
  UAN: varchar({length: 128}).unique().notNull(),
  name: varchar({length: 150}).notNull(),
  gender: varchar({length: 10}).notNull(),
  departmentId: varchar({length: 128}).references(()=> departmentTable.id, {onDelete: 'cascade'}).notNull(),
  courseId: varchar({length: 138}).references(()=> courseTable.id, {onDelete: 'cascade'}).notNull(),
  courseSessionId: varchar({length: 128}).references(()=> courseSessionTable.id, {onDelete: 'cascade'}).notNull(),
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
  id: varchar({length: 128}).primaryKey().$defaultFn(()=> createId()),
  UAN: varchar({length: 128}).unique().notNull(),
  registrationNumber: varchar({length: 128}).unique(),
  universityRoll: varchar({length: 128}).unique(),
  collegeRoll: varchar({length: 128}).unique(), // Ex. SSDC UG 202629 123 (College Name, Course Type, Session, Unique No.)
  name: varchar({length: 150}).notNull(),
  avatar: text().default(''),
  DOB: date().notNull(),
  AadharNumber: varchar({length: 12}).notNull(),
  gender: varchar({length: 10}).notNull(),
  fatherName: varchar({length: 50}).notNull(),
  motherName: varchar({length: 50}).notNull(),
  religion: varchar({length: 50}).notNull(),
  caste: varchar({length: 50}).notNull(),
  isMinority: boolean().default(false),
  currentSemesterCount: integer().notNull().default(1),
  currentSemesterId: varchar({length: 128}).references(()=> semesterTable.id, {onDelete: 'cascade'}).notNull(),
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
  ],
)

export const StudentPreviousAcademicRecordTable = pgTable('student_previous_academic_record',{
  id: varchar({length: 128}).primaryKey().$defaultFn(()=> createId()),
  studentId: varchar({length: 128}).references(()=> AdmittedStudentTable.id, {onDelete: 'cascade'}).notNull(),
  
  // Secondary School Records
  SSName: text().notNull(),
  SSBoard: text().notNull(),
  SSMarks: integer().notNull(),
  SSPercentage: integer().notNull(),
  SSRollNo: varchar({length: 128}).notNull(),
  SSAddress: text().notNull(),
  SSCity: text().notNull(),
  SSDist: text().notNull(),
  SSState: text().notNull(),
  SSPIN: text().notNull(),

  // Higher Secondary School Records
  HSSName: text().notNull(),
  HSSBoard: text().notNull(),
  HSSMarks: integer().notNull(),
  HSSPercentage: integer().notNull(),
  HSSRollNo: varchar({length: 128}).notNull(),
  HSSAddress: text().notNull(),
  HSSCity: text().notNull(),
  HSSDist: text().notNull(),
  HSSState: text().notNull(),
  HSSPIN: text().notNull(),

  // UG Records 
  UGName: text(),
  UGUniversity: text(),
  UGMarks: integer(),
  UGPercentage: integer(),
  UGRollNo: varchar({length: 128}),
  UGAddress: text(),
  UGCity: text(),
  UGDist: text(),
  UGState: text(),
  UGPIN: text(),
})


export const StudentDocumentsTable = pgTable('student_documents', {
  id: varchar({length: 128}).primaryKey().$defaultFn(()=> createId()),
  studentId: varchar({length: 128}).references(()=> AdmittedStudentTable.id, {onDelete: 'cascade'}).notNull(),
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



export const StudentFeePaymentTable = pgTable('student_fee_payment',{
  id: varchar({length: 128}).primaryKey().$defaultFn(()=> createId()),
  studentId: varchar({length: 128}).references(()=> AdmittedStudentTable.id, {onDelete: 'cascade'}).notNull(),
  semesterId: varchar({length: 128}).references(()=> semesterTable.id, {onDelete: 'cascade'}).notNull(),
  amount: integer().notNull().default(0),
  paymentMode: varchar({length: 30}).notNull().default('UPI'),
  transactionId: varchar({length: 255}).notNull(),
  status: varchar({length: 30}).notNull().default('Pending'),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
})


// Addionational table for Remarks for the student (handle by admin)
export const StudentRemarkTable = pgTable('student_remark',{
  id: varchar({length: 128}).primaryKey().$defaultFn(()=> createId()),
  studentId: varchar({length: 128}).references(()=> AdmittedStudentTable.id, {onDelete: 'cascade'}).notNull(),
  remarkBy: varchar({length: 128}).notNull(), // Admin/Super Admin User ID
  remarkType: varchar({length: 30}).notNull().default('Other'), // Academic, Attendance, Discipline, Other
  remark: text().notNull(),
  importance: text(),
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