import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import {
  check,
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { AdmittedStudentTable } from "./student";

// ─── CERTIFICATE FEE CONFIGURATION (single-row config) ─────────────────────────

export const CertificateMetaDataTable = pgTable(
  "certificate_meta_data",
  {
    id: varchar({ length: 128 })
      .primaryKey()
      .$defaultFn(() => createId()),
    certificate_type: text().notNull(),
    fee: integer().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
  },
  (table) => [
    check(
      "certificate_type_check",
      sql`${table.certificate_type} IN ('CLC', 'CHARACTER', 'BONAFIDE', 'TEST')`,
    ),
  ],
);

// ─── CERTIFICATE REQUEST ────────────────────────────────────────────────────────

export const CertificateRequestTable = pgTable(
  "certificate_request",
  {
    id: varchar({ length: 128 })
      .primaryKey()
      .$defaultFn(() => createId()),
    studentId: varchar({ length: 128 })
      .references(() => AdmittedStudentTable.id)
      .notNull(),
    certificateId: varchar({ length: 128 })
      .references(() => CertificateMetaDataTable.id)
      .notNull(),
    certificate_type: text().notNull().default("CLC"), // 'CLC', 'CHARACTER', 'BONAFIDE'
    certificate_No: text().unique(), // academic year + certificate type + college roll + serial no. (generated on admin approval)
    amount: integer(),
    transactionId: varchar({ length: 255 }),
    purpose: text().notNull(),
    status: varchar({ length: 20 }).notNull().default("INITIATE"),
    paymentStatus: varchar({ length: 20 }), // null | 'PENDING' | 'SUCCESS' | 'FAILED'
    behaviour: text(),
    division: text(),
    passingMonth: text(),
    passingYear: text(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
  },
  (table) => [
    check(
      "status_check",
      sql`${table.status} IN ('INITIATE', 'PENDING', 'APPROVED', 'CANCELLED')`,
    ),
  ],
);

// ─── CERTIFICATE RELATIONS ──────────────────────────────────────────────────────

export const certificateRequestRelations = relations(
  CertificateRequestTable,
  ({ one }) => ({
    student: one(AdmittedStudentTable, {
      fields: [CertificateRequestTable.studentId],
      references: [AdmittedStudentTable.id],
    }),
    certificate: one(CertificateMetaDataTable, {
      fields: [CertificateRequestTable.certificateId],
      references: [CertificateMetaDataTable.id],
    }),
  }),
);
