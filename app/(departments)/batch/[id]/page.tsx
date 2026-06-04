import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { getBatchesByCourse } from "./query/get-batch";
import { BatchCourseView } from "./_components/batch-course-view";

export default async function BatchIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(getBatchesByCourse(id));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BatchCourseView courseId={id} />
    </HydrationBoundary>
  );
}