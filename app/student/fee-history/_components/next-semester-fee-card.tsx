import {
  IconAlertCircle,
  IconArrowRight,
  IconCreditCard,
  IconSchool,
} from "@tabler/icons-react";
import Link from "next/link";

interface NextSemesterFeeCardProps {
  student: { id: string; currentSemesterCount: number; isPassed: boolean };
  nextSemesterAdmission: {
    startDate: string;
    endDate: string;
    lateFee: number | null;
  } | null;
  nextSemesterFees: {
    tuitionFee: number;
    practicalFee: number;
    lateFee: number;
    totalAmount: number;
  } | null;
  pendingNextSemesterPayment: { createdAt: string } | null;
  nextSemesterCount: number;
}

export function NextSemesterFeeCard({
  student,
  nextSemesterAdmission,
  nextSemesterFees,
  pendingNextSemesterPayment,
  nextSemesterCount,
}: NextSemesterFeeCardProps) {
  if (!nextSemesterAdmission || !nextSemesterFees) {
    return null;
  }

  return (
    <div className="bg-white border border-slate-150 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <IconCreditCard className="h-5 w-5 text-indigo-600" />
            Admission & Fees for Semester {nextSemesterCount}
          </h3>
          <p className="text-slate-400 text-xs font-semibold">
            Timeline:{" "}
            {new Date(nextSemesterAdmission.startDate).toLocaleDateString(
              "en-IN",
              { day: "2-digit", month: "short", year: "numeric" },
            )}{" "}
            to{" "}
            {new Date(nextSemesterAdmission.endDate).toLocaleDateString(
              "en-IN",
              { day: "2-digit", month: "short", year: "numeric" },
            )}
          </p>
        </div>
        <div>
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">
            <IconAlertCircle className="h-3.5 w-3.5" />
            Admission Open
          </span>
        </div>
      </div>

      {pendingNextSemesterPayment && (
        <div className="bg-amber-50/60 border border-amber-100/50 p-4 rounded-xl flex items-start gap-3">
          <IconAlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800">
            <span className="font-bold">Pending Payment Found:</span> You have a
            pending checkout initiated for Semester {nextSemesterCount} on{" "}
            {new Date(pendingNextSemesterPayment.createdAt).toLocaleDateString(
              "en-IN",
              {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              },
            )}
            . Click the button below to resume or retry.
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-indigo-50/30 border border-indigo-100/50 p-5 rounded-2xl">
        <div className="h-10 w-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center shrink-0">
          <IconSchool className="h-5 w-5" />
        </div>
        <div className="text-center sm:text-left space-y-0.5 flex-grow">
          <h4 className="text-xs font-extrabold text-slate-800">
            Next Semester Fee Structure
          </h4>
          <div className="text-slate-500 text-[11px] leading-relaxed space-y-0.5">
            <p>
              Admission & Tuition Fee: ₹
              {nextSemesterFees.tuitionFee.toLocaleString("en-IN")}
            </p>
            {nextSemesterFees.practicalFee > 0 && (
              <p>
                Practical Laboratory Surcharge: ₹
                {nextSemesterFees.practicalFee.toLocaleString("en-IN")}
              </p>
            )}
            {nextSemesterFees.lateFee > 0 && (
              <p className="text-rose-600 font-semibold">
                Late Fee Surcharge (Past Deadline): ₹
                {nextSemesterFees.lateFee.toLocaleString("en-IN")}
              </p>
            )}
          </div>
        </div>
        <div className="text-right pr-2 shrink-0">
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
            Total Payable
          </span>
          <span className="text-lg font-black text-indigo-700 block">
            ₹{nextSemesterFees.totalAmount.toLocaleString("en-IN")}
          </span>
        </div>
        <Link
          href={`/admission/payment?studentId=${student.id}&semesterCount=${nextSemesterCount}`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.98] transition-all cursor-pointer"
        >
          Pay Semester {nextSemesterCount} Fee
          <IconArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
