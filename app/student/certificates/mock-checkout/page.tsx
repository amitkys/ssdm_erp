"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, use } from "react";
import { simulateCertificateCallback } from "../lib/actions";
import { Button } from "@/components/ui/button";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function CertificateMockCheckoutPage({ searchParams }: PageProps) {
  const resolvedParams = use(searchParams);
  const requestId = (resolvedParams.requestId as string) || "";
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSimulate = async (status: "SUCCESS" | "FAILED") => {
    if (!requestId) {
      setError("Missing request ID.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await simulateCertificateCallback({ requestId, status });
      if (res.success) {
        router.push(`/certificate-payment-success?requestId=${requestId}`);
      } else {
        setError(res.message || "Simulation failed");
      }
    } catch (err: any) {
      setError(err.message || "Failed to simulate callback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl space-y-6 border border-slate-200">
        <div className="text-center space-y-2">
          <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full uppercase tracking-wider">
            Sandbox Developer Mode
          </span>
          <h2 className="text-xl font-bold text-slate-800">
            Certificate Gateway Bypass
          </h2>
          <p className="text-xs text-slate-500">
            Simulate GetEpay payment response for testing without hitting live gateway endpoints.
          </p>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl font-mono text-xs space-y-1 border border-slate-200">
          <div><span className="text-slate-400">Request ID:</span> {requestId || "N/A"}</div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button
            onClick={() => handleSimulate("SUCCESS")}
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-5 font-bold"
          >
            Simulate SUCCESS
          </Button>

          <Button
            onClick={() => handleSimulate("FAILED")}
            disabled={loading}
            variant="outline"
            className="w-full border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl py-5 font-bold"
          >
            Simulate FAILURE
          </Button>
        </div>
      </div>
    </div>
  );
}
