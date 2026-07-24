import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ContentLayout } from "@/components/content-layout";
import { auth } from "@/lib/auth";
import { CertificateRequestsPanel } from "./_components/certificate-requests-panel";
import { getAdminCertificateRequestsQuery } from "./query/get-certificate-requests";

export default async function AdminCertificateRequestsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (
    !session ||
    (session.user.role !== "admin" && session.user.role !== "superAdmin")
  ) {
    redirect("/auth/signin");
  }

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(getAdminCertificateRequestsQuery());

  return (
    <ContentLayout title="Certificate Requests">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <div className="flex flex-col gap-1 mb-6">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Certificate Requests Management
          </h1>
          <p className="text-sm text-slate-500">
            Review student certificate requests, enter conduct & division remarks, and issue downloadable certificates.
          </p>
        </div>
        <CertificateRequestsPanel />
      </HydrationBoundary>
    </ContentLayout>
  );
}
