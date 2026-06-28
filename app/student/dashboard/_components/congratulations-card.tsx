import { IconAward } from "@tabler/icons-react";
import type { DashboardStudent, DashboardBatch } from "../lib/types";

interface CongratulationsCardProps {
  student: DashboardStudent;
  batch: DashboardBatch | null;
}

export function CongratulationsCard({
  student,
  batch,
}: CongratulationsCardProps) {
  if (!student.isPassed) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100 border border-emerald-200/60 p-6 sm:p-8 shadow-xl">
      <div className="absolute right-0 bottom-0 top-0 w-1/4 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-emerald-400 to-transparent"></div>
      <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
        <div className="h-14 w-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20 animate-bounce">
          <IconAward className="h-8 w-8" />
        </div>
        <div className="text-center sm:text-left space-y-1.5 flex-grow">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-extrabold uppercase tracking-widest rounded-full">
            Course Completed
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Congratulations, {student.name}!
          </h2>
          <p className="text-slate-650 text-xs sm:text-sm font-medium leading-relaxed max-w-2xl">
            You have successfully passed all academic requirements and completed
            your program
            <span className="font-extrabold text-slate-800">
              {" "}
              {batch?.course?.name || "B.Sc"} (
              {batch?.academicSession?.name || "N/A"})
            </span>
            . Your hard work and dedication have earned you this accomplishment.
            We wish you the absolute best in all your future endeavors!
          </p>
        </div>
      </div>
    </div>
  );
}
