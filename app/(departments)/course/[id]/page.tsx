import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getAcademicSessionsQuery } from "@/app/(departments)/academic-session/query/get-academic-session";
import { ContentLayout } from "@/components/content-layout";
import { BatchContent } from "./_components/batch-content";
import { getBatchesByCourseQuery } from "./query/get-batches";
import { getCourseByIdQuery } from "./query/get-course-by-id";

export default async function CourseBatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery(getCourseByIdQuery(id)),
    queryClient.prefetchQuery(getBatchesByCourseQuery(id)),
    queryClient.prefetchQuery(getAcademicSessionsQuery()),
  ]);

  return (
    <ContentLayout title="Course Batches">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <BatchContent courseId={id} />
      </HydrationBoundary>
    </ContentLayout>
  );
}
