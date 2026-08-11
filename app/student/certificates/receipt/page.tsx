import { redirect } from "next/navigation";
import { getCertificateReceiptData } from "../lib/get-receipt-data";
import { PrinterTrigger } from "@/app/(students)/admission/print/receipt/_components/printer-trigger";

interface ReceiptPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CertificatePaymentReceiptPage({
  searchParams,
}: ReceiptPageProps) {
  const resolvedParams = await searchParams;
  const requestId = resolvedParams.requestId as string | undefined;

  if (!requestId) {
    redirect("/student/certificates");
  }

  const result = await getCertificateReceiptData(requestId);

  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8 font-sans">
        <div className="text-center space-y-3">
          <div className="h-16 w-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="h-8 w-8 text-rose-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-slate-800">
            Receipt Unavailable
          </h2>
          <p className="text-sm text-slate-500 max-w-sm">
            {result.message ||
              "Unable to generate receipt. Please ensure payment was completed successfully."}
          </p>
        </div>
      </div>
    );
  }

  const { college, student, certificateType, certificateStatus, transactionId, amount, paymentMode, paymentDate, paymentStatus } = result.data;

  const formattedDate = new Date(paymentDate).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const certTypeDisplay =
    certificateType === "CLC" ? "CLC + CHARACTER" : certificateType;

  const certStatusDisplay =
    certificateStatus === "APPROVED" ? "APPROVED" : "Awaiting Approval";

  const certStatusColor =
    certificateStatus === "APPROVED"
      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
      : "text-amber-700 bg-amber-50 border-amber-200";

  return (
    <div className="min-h-screen bg-white text-slate-900 p-8 print:p-6 max-w-3xl mx-auto font-sans selection:bg-slate-200">
      <PrinterTrigger delayMs={600} />

      {/* ─── PRINT STYLES ─── */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page {
                size: A4 portrait;
                margin: 12mm 10mm;
              }
              body {
                margin: 0;
                background: #fff;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .no-print {
                display: none !important;
              }
            }
          `,
        }}
      />

      {/* ─── COLLEGE HEADER WITH LOGO ─── */}
      <div className="border-b-4 border-double border-slate-800 pb-5 text-center">
        <div className="flex items-center justify-center gap-4 mb-2">
          <img
            src="/college.png"
            alt="College Logo"
            className="h-16 w-16 object-contain print:h-14 print:w-14"
          />
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">
              {college.name}
            </h1>
            <p className="text-[11px] text-slate-500 font-medium font-serif">
              Affiliated with University • Government Registered Institution
            </p>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 font-mono mt-1">
          {college.address}, {college.city}, {college.state} — {college.pincode}{" "}
          • Email: {college.email} • Phone: {college.phone}
        </p>
      </div>

      {/* ─── RECEIPT TITLE ─── */}
      <div className="my-6 print:my-4 text-center">
        <span className="border-2 border-slate-900 px-6 py-1.5 text-xs font-black uppercase tracking-widest bg-slate-50 inline-block">
          Certificate Fee Payment Receipt
        </span>
      </div>

      {/* ─── STUDENT DETAILS ─── */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-4 print:gap-y-2 text-xs border border-slate-200 rounded-xl p-6 print:p-4 bg-slate-50/50">
        <div>
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
            Student Name
          </span>
          <p className="font-extrabold text-slate-800 mt-0.5 text-sm">
            {student.name}
          </p>
        </div>
        <div>
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
            College Roll Number
          </span>
          <p className="font-mono font-bold text-slate-800 mt-0.5 text-sm">
            {student.collegeRoll}
          </p>
        </div>
        <div>
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
            Batch with Session
          </span>
          <p className="font-semibold text-slate-800 mt-0.5 text-sm">
            {student.batchWithSession}
          </p>
        </div>
        <div>
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
            Certificate Type
          </span>
          <p className="font-bold text-slate-800 mt-0.5 text-sm">
            {certTypeDisplay}
          </p>
        </div>
      </div>

      {/* ─── TRANSACTION DETAILS ─── */}
      <div className="mt-6 print:mt-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-2 border-b border-slate-200 pb-1">
          Payment Transaction Details
        </h3>
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider text-[9px]">
              <tr>
                <th className="px-4 py-2">Transaction ID</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Payment Mode</th>
                <th className="px-4 py-2">Payment Date</th>
                <th className="px-4 py-2 text-right">Payment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              <tr>
                <td className="px-4 py-3 text-[11px]">{transactionId}</td>
                <td className="px-4 py-3 font-bold text-emerald-700 text-sm">
                  ₹
                  {Number(amount).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td className="px-4 py-3 font-sans font-medium">
                  {paymentMode}
                </td>
                <td className="px-4 py-3 font-sans text-[11px]">
                  {formattedDate}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-sans font-black text-emerald-700">
                    {paymentStatus === "SUCCESS" ? "CONFIRMED" : paymentStatus}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── CERTIFICATE STATUS ─── */}
      <div className="mt-6 print:mt-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-2 border-b border-slate-200 pb-1">
          Certificate Status
        </h3>
        <div className="border border-slate-200 rounded-xl p-4 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Current Status
          </span>
          <span
            className={`px-4 py-1.5 border text-xs font-bold rounded-full uppercase tracking-wider ${certStatusColor}`}
          >
            {certStatusDisplay}
          </span>
        </div>
      </div>

      {/* ─── FOOTER NOTE + SIGNATURE ─── */}
      <div className="mt-10 print:mt-6 grid grid-cols-2 gap-8 text-xs border-t border-slate-200 pt-6 print:pt-4">
        <div className="space-y-2">
          <p className="font-bold text-slate-800">Important Note:</p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-1.5">
            <p className="text-amber-800 font-semibold text-[11px] leading-relaxed">
              ⏳ Please collect your certificate from the college after 24 hours
              of approval.
            </p>
            <p className="text-amber-700/80 text-[10px] leading-relaxed">
              Bring a valid photo ID along with a printout of this receipt when
              collecting your certificate.
            </p>
          </div>
          <ul className="list-disc pl-4 space-y-1 text-slate-500 leading-relaxed text-[11px] mt-2">
            <li>This is a computer-generated receipt and does not require a physical signature.</li>
            <li>Fee once paid is non-refundable under any circumstances.</li>
          </ul>
        </div>
        <div className="flex flex-col items-end justify-end space-y-1 pb-2">
          <div className="h-12 w-36 border-b border-slate-400 flex items-center justify-center text-slate-300 text-[10px] italic">
            Computer Generated
          </div>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider text-right">
            Authorized Signature
          </p>
        </div>
      </div>
    </div>
  );
}
