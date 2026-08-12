import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { AdmissionOverviewClient } from "./_components/admission-overview-client";

export default async function AdmissionOverviewPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "admin" && session.user.role !== "superAdmin") {
    redirect("/student/dashboard");
  }

  return <AdmissionOverviewClient />;
}
