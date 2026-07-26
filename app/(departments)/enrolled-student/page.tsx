import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getAcademicSessionsQuery } from "@/app/(departments)/academic-session/query/get-academic-session";
import { ContentLayout } from "@/components/content-layout";
import { EnrollStudentPanel } from "./_components/enroll-student-panel";
import { getActiveSubjectsQuery } from "./query/get-active-subjects";

export default async function EnrolledStudentPage() {
  const queryClient = new QueryClient();

  // Prefetch session & active subjects
  await Promise.all([
    queryClient.prefetchQuery(getAcademicSessionsQuery()),
    queryClient.prefetchQuery(getActiveSubjectsQuery()),
  ]);

  return (
    <ContentLayout title="Enroll Student">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <div className="flex flex-col gap-1 mb-6">
          <h1 className="text-2xl font-semibold">
            1st Semester Enrolled Student Insertion
          </h1>
          <p className="text-sm text-muted-foreground">
            Manually insert student details directly into the enrolled students
            list for admission.
          </p>
        </div>
        <EnrollStudentPanel />
      </HydrationBoundary>
    </ContentLayout>
  );
}
