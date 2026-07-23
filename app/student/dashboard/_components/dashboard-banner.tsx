import { IconSchool } from "@tabler/icons-react";
import type { DashboardStudent, DashboardBatch } from "../lib/types";

interface DashboardBannerProps {
  student: DashboardStudent;
  batch: DashboardBatch | null;
}

export function DashboardBanner({ student, batch }: DashboardBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-8 sm:p-10 shadow-2xl border border-indigo-950">
      <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-indigo-300 via-blue-900 to-transparent"></div>
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-xs font-semibold text-indigo-200">
            <IconSchool className="h-3.5 w-3.5" />
            {student.isPassed
              ? "Graduated Profile"
              : "Active Admission Profile"}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-clip-text bg-gradient-to-r from-white via-slate-100 to-indigo-100">
            Welcome back, {student.name}!
          </h1>
          <p className="text-slate-300 text-sm max-w-lg font-medium">
            {student.isPassed
              ? "View your course records, transaction receipts, and final certification status from your portal."
              : "Keep track of your course progress, manage tuition and exam fees, and print official college receipts from your portal."}
          </p>
        </div>

        {/* Quick Profile Info Grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl md:min-w-[320px] text-xs font-medium">
          <div>
            <span className="text-indigo-200/70 block uppercase tracking-wider text-[9px] font-bold">
              College Roll
            </span>
            <span className="font-mono text-white text-sm font-bold mt-0.5 block">
              {student.collegeRoll}
            </span>
          </div>
          <div>
            <span className="text-indigo-200/70 block uppercase tracking-wider text-[9px] font-bold">
              UAN Reference
            </span>
            <span className="font-mono text-white text-sm font-bold mt-0.5 block">
              {student.UAN}
            </span>
          </div>
          <div className="col-span-2 border-t border-white/10 pt-2.5 mt-1">
            <span className="text-indigo-200/70 block uppercase tracking-wider text-[9px] font-bold">
              Current Course & Batch
            </span>
            <span className="text-slate-100 font-semibold mt-0.5 block truncate">
              {batch?.course?.name || "B.A./B.Sc./B.Com"} (
              {batch?.academicSession?.name || "N/A"})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
