import { SiteFooter } from "@/components/informative/site-footer";
import { SiteHeader } from "@/components/informative/site-header";
import { getCollegeConfig } from "@/lib/college-config";
import { VerificationCard } from "./_components/verificationCard";

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  const { batchId } = await params;
  const config = getCollegeConfig();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-900 selection:text-white">
      <SiteHeader collegeName={config.name} />
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <VerificationCard batchId={batchId} />
      </main>
      <SiteFooter config={config} />
    </div>
  );
}
