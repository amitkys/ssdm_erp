import type { InferSelectModel } from "drizzle-orm";
import type {
  AdmittedStudentTable,
  StudentPreviousAcademicRecordTable,
  StudentDocumentsTable,
} from "@/lib/db/schema";
import type {
  batchTable,
  courseTable,
  departmentTable,
  academicSessionTable,
} from "@/lib/db/schema";

// The full student profile shape returned by the relational query
export type StudentProfile = InferSelectModel<typeof AdmittedStudentTable> & {
  batch: InferSelectModel<typeof batchTable> & {
    course: InferSelectModel<typeof courseTable> & {
      department: InferSelectModel<typeof departmentTable>;
    };
    academicSession: InferSelectModel<typeof academicSessionTable>;
  };
  previousAcademicRecord: InferSelectModel<
    typeof StudentPreviousAcademicRecordTable
  > | null;
  documents: InferSelectModel<typeof StudentDocumentsTable> | null;
};
