import type { InferSelectModel } from "drizzle-orm";
import type {
  CertificateMetaDataTable,
  CertificateRequestTable,
} from "@/lib/db/schema/certificate";
import type { AdmittedStudentTable } from "@/lib/db/schema/student";

export type CertificateMetaData = InferSelectModel<
  typeof CertificateMetaDataTable
>;

export type CertificateRequest = InferSelectModel<
  typeof CertificateRequestTable
>;

export type CertificateRequestWithDetails = CertificateRequest & {
  student: InferSelectModel<typeof AdmittedStudentTable>;
  certificate: CertificateMetaData;
};

export type CertificateRequestWithCertificate = CertificateRequest & {
  certificate: CertificateMetaData;
};
