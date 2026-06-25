import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { ContentLayout } from "@/components/content-layout";
import { SemesterAdmissionOpenContent } from "./_components/semester-admission-open-content";
import { getAcademicSessionsQuery } from "./query/get-academic-sessions";
import { getSemesterAdmissionOpensQuery } from "./query/get-semester-admission-opens";

export default async function SemesterAdmissionOpenPage() {
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery(getSemesterAdmissionOpensQuery()),
    queryClient.prefetchQuery(getAcademicSessionsQuery()),
  ]);

  return (
    <ContentLayout title="Semester Admissions">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <div className="flex flex-col gap-1 mb-4">
          <h1 className="text-2xl font-semibold">Semester Admissions</h1>
          <p className="text-sm text-muted-foreground">
            Configure dates, deadlines, and late fines for students to register
            and pay fees for subsequent semesters.
          </p>
        </div>
        <SemesterAdmissionOpenContent />
      </HydrationBoundary>
    </ContentLayout>
  );
}
