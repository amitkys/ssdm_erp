import { ContentLayout } from "@/components/content-layout";
import CertificateDCRClient from "./_components/certificate-dcr-client";
import {
  getCertificateDCRFilterOptions,
  getCertificateDCRReport,
  getCertificateDCRStats,
} from "./lib/action";

export const dynamic = "force-dynamic";

export default async function CertificateDCRPage() {
  const statsRes = await getCertificateDCRStats();
  const reportRes = await getCertificateDCRReport(); // Initial fetch: default SUCCESS payments
  const filterOptionsRes = await getCertificateDCRFilterOptions();

  const initialStats =
    statsRes.success && statsRes.stats
      ? statsRes.stats
      : {
          today: { amount: 0, count: 0 },
          month: { amount: 0, count: 0 },
          total: { amount: 0, count: 0 },
        };

  const initialReport =
    reportRes.success && reportRes.report ? reportRes.report : [];

  const filterOptions =
    filterOptionsRes.success &&
    filterOptionsRes.departments &&
    filterOptionsRes.courses &&
    filterOptionsRes.batches &&
    filterOptionsRes.certificateTypes
      ? {
          departments: filterOptionsRes.departments,
          courses: filterOptionsRes.courses,
          batches: filterOptionsRes.batches,
          certificateTypes: filterOptionsRes.certificateTypes,
        }
      : {
          departments: [],
          courses: [],
          batches: [],
          certificateTypes: ["CLC", "CHARACTER", "BONAFIDE", "TEST"],
        };

  return (
    <ContentLayout title="Certificate DCR">
      <CertificateDCRClient
        initialStats={initialStats}
        initialReport={initialReport}
        filterOptions={filterOptions}
      />
    </ContentLayout>
  );
}
