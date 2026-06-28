import type { InferSelectModel } from "drizzle-orm";
import type { AdmittedStudentTable } from "@/lib/db/schema/student";
import type {
  batchTable,
  courseTable,
  academicSessionTable,
} from "@/lib/db/schema/department";

export type DashboardStudent = InferSelectModel<typeof AdmittedStudentTable>;

export type DashboardBatch = InferSelectModel<typeof batchTable> & {
  course: InferSelectModel<typeof courseTable>;
  academicSession: InferSelectModel<typeof academicSessionTable>;
};

export interface DashboardData {
  student: DashboardStudent;
  batch: DashboardBatch | null;
}
