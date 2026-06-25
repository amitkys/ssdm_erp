import { integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const miscellaneousPaymentTable = pgTable("miscellaneous_payment", {
  id: varchar({ length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  invoiceNumber: varchar({ length: 20 }).notNull().unique(),
  reason: text().notNull(),
  name: varchar({ length: 100 }).notNull(),
  amount: integer().notNull(),
  address: text().notNull(),
  purpose: text().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});
