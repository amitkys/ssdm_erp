import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ContentLayout } from "@/components/content-layout";
import { auth } from "@/lib/auth";
import { FeeHistoryContent } from "./_components/fee-history-content";
import { getStudentFeeDataQuery } from "./query/get-student-fee-data";

export default async function StudentFeeHistoryPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "student") {
    redirect("/auth/signin");
  }

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(getStudentFeeDataQuery());

  return (
    <ContentLayout title="Fee History">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <div className="max-w-5xl mx-auto space-y-8 p-1 sm:p-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Fee History & Receipts
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Monitor semester fee status, complete upcoming checkouts, and
              print official payment receipts.
            </p>
          </div>
          <FeeHistoryContent />
        </div>
      </HydrationBoundary>
    </ContentLayout>
  );
}
