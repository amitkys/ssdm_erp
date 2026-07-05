import { relations, sql } from "drizzle-orm";
import {
  check,
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { AdmittedStudentTable } from "./student";

// ─── CERTIFICATE FEE CONFIGURATION (single-row config) ─────────────────────────

export const CertificateMetaDataTable = pgTable("certificate_meta_data", {
  id: varchar({ length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  clcFee: integer().notNull().default(500),
  characterFee: integer().notNull().default(200),
  bonafideFee: integer().notNull().default(100),
});

// ─── CERTIFICATE REQUEST ────────────────────────────────────────────────────────

export const CertificateRequestTable = pgTable(
  "certificate_request",
  {
    id: varchar({ length: 128 })
      .primaryKey()
      .$defaultFn(() => createId()),
    studentId: varchar({ length: 128 })
      .references(() => AdmittedStudentTable.id, { onDelete: "cascade" })
      .notNull(),
    certificateType: varchar({ length: 30 }).notNull(),
    fee: integer().notNull(),
    transactionId: varchar({ length: 255 }).notNull(),
    purpose: text().notNull(),
    status: varchar({ length: 20 }).notNull().default("PENDING"),
    behaviour: text(),
    division: text(),
    passingMonth: text(),
    passingYear: text(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
  },
  (table) => [
    check(
      "certificateType_check",
      sql`${table.certificateType} IN ('CLC_CHARACTER', 'CHARACTER', 'BONAFIDE')`,
    ),
    check(
      "status_check",
      sql`${table.status} IN ('PENDING', 'APPROVED')`,
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
  }),
);
