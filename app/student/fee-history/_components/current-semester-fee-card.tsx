import {
  IconAlertCircle,
  IconArrowRight,
  IconCheck,
  IconCreditCard,
  IconPrinter,
  IconReceipt,
} from "@tabler/icons-react";
import Link from "next/link";

interface CurrentSemesterFeeCardProps {
  student: { id: string; currentSemesterCount: number; isPassed: boolean };
  hasPaid: boolean;
  payment: {
    id: string;
    amount: number;
    paymentMode: string;
    transactionId: string;
  } | null;
  isCurrentSemesterAdmissionOpen: boolean;
}

export function CurrentSemesterFeeCard({
  student,
  hasPaid,
  payment,
  isCurrentSemesterAdmissionOpen,
}: CurrentSemesterFeeCardProps) {
  return (
    <div className="bg-white border border-slate-150 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="space-y-1">
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <IconCreditCard className="h-5 w-5 text-indigo-600" />
            Semester Tuition & Registration Fee
          </h2>
          <p className="text-slate-400 text-xs font-semibold">
            Manage payment details for Semester {student.currentSemesterCount}
          </p>
        </div>
        <div>
          {student.isPassed ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold uppercase tracking-wider">
              <IconCheck className="h-3.5 w-3.5" />
              Completed
            </span>
          ) : hasPaid ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold uppercase tracking-wider">
              <IconCheck className="h-3.5 w-3.5" />
              Paid
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">
              <IconAlertCircle className="h-3.5 w-3.5" />
              Pending Payment
            </span>
          )}
        </div>
      </div>

      {student.isPassed ? (
        <div className="p-5 bg-emerald-50/20 border border-emerald-100/50 rounded-2xl flex items-center gap-4 text-xs text-emerald-800 font-semibold">
          <div className="h-8 w-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center shrink-0">
            <IconCheck className="h-4.5 w-4.5" />
          </div>
          <span>
            Your academic batch is successfully completed and passed. No
            additional fee transactions are pending for this semester.
          </span>
        </div>
      ) : hasPaid && payment ? (
        <div className="space-y-6">
          <div className="p-5 bg-slate-50/70 border border-slate-100 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs">
            <div>
              <span className="text-slate-400 font-bold block uppercase tracking-wider text-[9px]">
                Amount Authenticated
              </span>
              <span className="font-extrabold text-slate-800 text-sm mt-0.5 block">
                ₹{Number(payment.amount).toLocaleString("en-IN")}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block uppercase tracking-wider text-[9px]">
                Payment Mode
              </span>
              <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                {payment.paymentMode}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-400 font-bold block uppercase tracking-wider text-[9px]">
                Transaction ID
              </span>
              <span className="font-mono font-bold text-slate-800 text-sm mt-0.5 block truncate">
                {payment.transactionId}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 bg-emerald-50/30 border border-emerald-100/50 p-5 rounded-2xl">
            <div className="h-10 w-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center shrink-0">
              <IconReceipt className="h-5 w-5" />
            </div>
            <div className="text-center sm:text-left space-y-0.5 flex-grow">
              <h4 className="text-xs font-extrabold text-slate-800">
                Payment Receipt & Application Receipt Ready
              </h4>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Your transaction was processed successfully. You can now
                download and print your official college payment receipt and
                admission form application.
              </p>
            </div>
            <Link
              href={`/payment-success?paymentId=${payment.id}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/20 active:scale-[0.98] transition-all"
            >
              <IconPrinter className="h-4 w-4" />
              Print Receipt
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-amber-50/40 border border-amber-100 p-5 rounded-2xl">
            <div className="h-10 w-10 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center shrink-0">
              <IconAlertCircle className="h-5 w-5" />
            </div>
            <div className="text-center sm:text-left space-y-0.5 flex-grow">
              <h4 className="text-xs font-extrabold text-slate-800">
                Tuition Fees Pending for Semester {student.currentSemesterCount}
              </h4>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                {isCurrentSemesterAdmissionOpen
                  ? "You have not completed the fee payment registration for your current academic semester. Please clear the outstanding tuition and registration fee balance to retain access to classes and examinations."
                  : "The online fee payment window for your current semester is closed. If you have completed your payment offline or require assistance, please contact the college administration."}
              </p>
            </div>
            {isCurrentSemesterAdmissionOpen && (
              <Link
                href={`/admission/payment?studentId=${student.id}&semesterCount=${student.currentSemesterCount}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-600/15 hover:shadow-indigo-600/25 hover:translate-x-0.5 active:scale-[0.98] transition-all"
              >
                Pay Semester Fee
                <IconArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
