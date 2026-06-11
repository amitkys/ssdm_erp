import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { ContentLayout } from "@/components/content-layout";
import { AdmissionOpenContent } from "./_components/admission-open-content";
import { getAdmissionOpensQuery } from "./query/get-admission-opens";
import { getBatchesQuery } from "./query/get-batches";

export default async function AdmissionOpenPage() {
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery(getAdmissionOpensQuery()),
    queryClient.prefetchQuery(getBatchesQuery()),
  ]);

  return (
    <ContentLayout title="Admission Opens">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <div className="flex flex-col gap-1 mb-4">
          <h1 className="text-2xl font-semibold">Admission Opens</h1>
          <p className="text-sm text-muted-foreground">
            Configure open admission dates, deadlines, and extensions for active
            course batches.
          </p>
        </div>
        <AdmissionOpenContent />
      </HydrationBoundary>
    </ContentLayout>
  );
}
