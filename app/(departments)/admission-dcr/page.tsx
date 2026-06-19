import { ContentLayout } from "@/components/content-layout";
import DCRClient from "./_components/dcr-client";
import { getDCRFilterOptions, getDCRReport, getDCRStats } from "./lib/action";

export const dynamic = "force-dynamic";

export default async function AdmissionDCRPage() {
  const statsRes = await getDCRStats();
  const reportRes = await getDCRReport({ semester: "1" }); // Initial fetch defaults to Semester 1
  const filterOptionsRes = await getDCRFilterOptions();

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
    filterOptionsRes.batches
      ? {
          departments: filterOptionsRes.departments,
          courses: filterOptionsRes.courses,
          batches: filterOptionsRes.batches,
        }
      : { departments: [], courses: [], batches: [] };

  return (
    <ContentLayout title="Admission DCR">
      <DCRClient
        initialStats={initialStats}
        initialReport={initialReport}
        filterOptions={filterOptions}
      />
    </ContentLayout>
  );
}
