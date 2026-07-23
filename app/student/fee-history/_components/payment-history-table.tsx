import { IconPrinter, IconReceipt } from "@tabler/icons-react";
import Link from "next/link";

interface PaymentRecord {
  id: string;
  semesterCount: number;
  transactionId: string;
  paymentMode: string;
  amount: number;
  createdAt: string;
}

interface PaymentHistoryTableProps {
  allPayments: PaymentRecord[];
}

export function PaymentHistoryTable({ allPayments }: PaymentHistoryTableProps) {
  return (
    <div className="bg-white border border-slate-150 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
      <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
        <IconReceipt className="h-5 w-5 text-indigo-600" />
        Payment History & Receipts
      </h2>

      {allPayments.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-slate-150">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-150">
              <tr>
                <th className="px-6 py-3">Semester</th>
                <th className="px-6 py-3">Transaction ID</th>
                <th className="px-6 py-3">Mode</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Date Paid</th>
                <th className="px-6 py-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 font-medium text-slate-700">
              {allPayments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-bold text-slate-800">
                    Semester {p.semesterCount}
                  </td>
                  <td className="px-6 py-4 font-mono text-[11px]">
                    {p.transactionId}
                  </td>
                  <td className="px-6 py-4">{p.paymentMode}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">
                    ₹{Number(p.amount).toLocaleString("en-IN")}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(p.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 text-right font-sans">
                    <Link
                      href={`/admission/print/receipt?paymentId=${p.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 border border-slate-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      <IconPrinter className="h-3.5 w-3.5" />
                      Print / PDF
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-slate-400 text-center py-6 font-medium">
          No fee payment records found.
        </p>
      )}
    </div>
  );
}
