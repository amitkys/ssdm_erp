import { eq } from "drizzle-orm";
import Link from "next/link";
import { processCertificatePaymentReturn } from "@/app/student/certificates/lib/actions";
import { SiteFooter } from "@/components/informative/site-footer";
import { SiteHeader } from "@/components/informative/site-header";
import { getCollegeConfig } from "@/lib/college-config";
import { db } from "@/lib/db";
import { CertificateRequestTable } from "@/lib/db/schema/certificate";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CertificatePaymentSuccessPage({
  searchParams,
}: PageProps) {
  const resolvedParams = await searchParams;
  const response = resolvedParams.response as string | undefined;

  const config = getCollegeConfig();

  let paymentResult: {
    requestId: string;
    status: string;
    paymentStatus: string | null;
    amount: number | null;
    txnId: string | null;
    certificateType: string;
    errorMessage: string | null;
  } | null = null;

  let errorMsg: string | null = null;
  let lookupRequestId: string | null = null;

  if (response) {
    const res = await processCertificatePaymentReturn(response);
    if (res.success && res.requestId) {
      lookupRequestId = res.requestId;
    } else {
      errorMsg = res.message || "Failed to parse transaction response.";
    }
  } else if (resolvedParams.requestId) {
    lookupRequestId = resolvedParams.requestId as string;
  } else {
    errorMsg =
      "No transaction response payload was received from the payment gateway.";
  }

  if (lookupRequestId) {
    const sleep = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));
    let request = null;

    for (let attempt = 1; attempt <= 8; attempt++) {
      request = await db.query.CertificateRequestTable.findFirst({
        where: eq(CertificateRequestTable.id, lookupRequestId),
        with: { certificate: true, student: true },
      });

      console.log(`[CertificatePaymentSuccess] Poll attempt ${attempt}/8:`, {
        requestId: lookupRequestId,
        status: request?.status,
        paymentStatus: request?.paymentStatus,
      });

      if (request && request.paymentStatus && request.paymentStatus !== "PENDING") {
        break;
      }

      if (attempt < 8) {
        await sleep(800);
      }
    }


    if (request) {
      paymentResult = {
        requestId: request.id,
        status: request.status,
        paymentStatus: request.paymentStatus,
        amount: request.amount ?? request.certificate.fee,
        txnId: request.transactionId,
        certificateType: request.certificate_type,
        errorMessage:
          request.paymentStatus === "FAILED"
            ? "Transaction failed or was cancelled."
            : null,
      };
    } else {
      errorMsg = "Certificate request reference was not found in our records.";
    }
  }

  const isSuccess = paymentResult?.paymentStatus === "SUCCESS";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-900 selection:text-white">
      <SiteHeader collegeName={config.name} />
      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-slate-100/50 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            {isSuccess ? (
              <>
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-10 text-white text-center space-y-3 relative overflow-hidden">
                  <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto ring-4 ring-white/10">
                    <CheckCircle2 className="h-10 w-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-extrabold tracking-tight">
                    Certificate Fee Payment Successful!
                  </h2>
                  <p className="text-emerald-100 text-sm max-w-sm mx-auto">
                    Your request has been submitted to the administrative department for verification.
                  </p>
                </div>

                <div className="p-8 space-y-6">
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 space-y-4">
                    <div className="flex justify-between items-center text-sm border-b border-slate-200/60 pb-3">
                      <span className="text-slate-500 font-medium">Certificate Type</span>
                      <span className="font-bold text-slate-800">
                        {paymentResult?.certificateType === "CLC" ? "CLC + CHARACTER" : paymentResult?.certificateType}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-slate-200/60 pb-3">
                      <span className="text-slate-500 font-medium">Amount Paid</span>
                      <span className="font-extrabold text-emerald-600 text-base">
                        ₹{paymentResult?.amount ?? 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-slate-200/60 pb-3">
                      <span className="text-slate-500 font-medium">Transaction Reference</span>
                      <span className="font-mono text-xs font-semibold text-slate-700">
                        {paymentResult?.txnId || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-medium">Request Status</span>
                      <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold rounded-full uppercase tracking-wider">
                        Awaiting Approval
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Link
                      href="/student/certificates"
                      className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-semibold transition text-center shadow-lg flex items-center justify-center gap-2"
                    >
                      View My Certificate Requests
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-gradient-to-r from-rose-500 to-red-600 px-8 py-10 text-white text-center space-y-3 relative overflow-hidden">
                  <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto ring-4 ring-white/10 animate-pulse">
                    <XCircle className="h-10 w-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-extrabold tracking-tight">
                    Certificate Payment Failed
                  </h2>
                  <p className="text-rose-100 text-sm max-w-sm mx-auto">
                    {errorMsg || paymentResult?.errorMessage || "We could not process your certificate payment."}
                  </p>
                </div>

                <div className="p-8 space-y-6">
                  <p className="text-xs text-slate-400 text-center leading-relaxed max-w-md mx-auto">
                    If any amount was deducted, please wait for auto-reconciliation or contact college support. You can retry paying from your certificate request table.
                  </p>

                  <div className="flex gap-4">
                    <Link
                      href="/student/certificates"
                      className="flex-1 py-3.5 bg-slate-900 text-white rounded-2xl text-sm font-semibold hover:bg-slate-950 transition text-center shadow-lg flex items-center justify-center gap-2"
                    >
                      Back to Certificates
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <SiteFooter config={config} />
    </div>
  );
}
