import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getAcademicSessionsQuery } from "@/app/(departments)/academic-session/query/get-academic-session";
import { getCoursesQuery } from "@/app/(departments)/course/query/get-courses";
import { getDepartment } from "@/app/(departments)/department/query/get-all-department";
import { ContentLayout } from "@/components/content-layout";
import { StudentSearchPanel } from "./_components/student-search-panel";

export default async function StudentRecordsPage() {
  const queryClient = new QueryClient();

  // Prefetch academic data for filters
  await Promise.all([
    queryClient.prefetchQuery(getAcademicSessionsQuery()),
    queryClient.prefetchQuery(getDepartment()),
    queryClient.prefetchQuery(getCoursesQuery()),
  ]);

  return (
    <ContentLayout title="Student Records">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <div className="flex flex-col gap-1 mb-6">
          <h1 className="text-2xl font-semibold">
            Student Directory & Records
          </h1>
          <p className="text-sm text-muted-foreground">
            Search and view student profiles, correct academic or personal
            records, and promote graduating students to Passed status.
          </p>
        </div>
        <div className="mt-6">
          <StudentSearchPanel />
        </div>
      </HydrationBoundary>
    </ContentLayout>
  );
}
