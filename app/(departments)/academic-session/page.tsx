import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { ContentLayout } from "@/components/content-layout";
import { SessionTabsTable } from "./_components/session-tabs-table";
import { getAcademicSessionsQuery } from "./query/get-academic-session";

export default async function AcademicSessionPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(getAcademicSessionsQuery());

  return (
    <ContentLayout title="Academic Session">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">Academic Sessions</h1>
          <p className="text-sm text-muted-foreground">
            View active and depreciated college sessions.
          </p>
        </div>
        <SessionTabsTable />
      </HydrationBoundary>
    </ContentLayout>
  );
}
