import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ContentLayout } from "@/components/content-layout";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdmittedStudentTable } from "@/lib/db/schema/student";
import { certificateMetaQueryOptions } from "./query/use-get-certificate-meta";
import { certificateRequestsQueryOptions } from "./query/use-get-certificate-requests";
import { CertificateContent } from "./_components/certificate-content";

export default async function StudentCertificatesPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "student") {
    redirect("/auth/signin");
  }

  const email = session.user.email;

  // Find admitted student record matching authenticated email
  let student = await db.query.AdmittedStudentTable.findFirst({
    where: eq(AdmittedStudentTable.email, email),
  });

  // If not found and using student UAN email format, extract UAN and search
  if (!student && email.endsWith("@student.ssdm.local")) {
    const uan = email.split("@")[0].toUpperCase();
    student = await db.query.AdmittedStudentTable.findFirst({
      where: eq(AdmittedStudentTable.UAN, uan),
    });
  }

  if (!student) {
    return (
      <ContentLayout title="Certificates">
        <div className="max-w-xl mx-auto mt-12 bg-white border border-slate-100 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <h2 className="text-xl font-black text-slate-800">
            Student Profile Not Found
          </h2>
          <p className="text-sm text-slate-500">
            Your login credentials are not linked with any active student
            record. Please contact the college administrator.
          </p>
        </div>
      </ContentLayout>
    );
  }

  // Prefetch data for client components
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery(certificateMetaQueryOptions()),
    queryClient.prefetchQuery(certificateRequestsQueryOptions(student.id)),
  ]);

  return (
    <ContentLayout title="Certificates">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <CertificateContent studentId={student.id} />
      </HydrationBoundary>
    </ContentLayout>
  );
}
