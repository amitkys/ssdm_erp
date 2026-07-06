import {
  IconCalendar,
  IconMail,
  IconPhone,
  IconSchool,
  IconUser,
} from "@tabler/icons-react";
import type { DashboardStudent, DashboardBatch } from "../lib/types";

interface AcademicProfileGridProps {
  student: DashboardStudent;
  batch: DashboardBatch | null;
}

export function AcademicProfileGrid({
  student,
  batch,
}: AcademicProfileGridProps) {
  return (
    <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      <h2 className="text-base font-extrabold text-foreground flex items-center gap-2 border-b border-border/55 pb-3">
        <IconUser className="h-5 w-5 text-primary" />
        Academic Profile
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="flex items-start gap-3 bg-muted/40 p-4 rounded-xl border border-border/50">
          <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <IconSchool className="h-5 w-5" />
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px] font-bold uppercase tracking-wider">
              Current Semester
            </span>
            <span className="text-foreground font-extrabold text-sm mt-0.5 block">
              Semester {student.currentSemesterCount}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-3 bg-muted/40 p-4 rounded-xl border border-border/50">
          <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <IconCalendar className="h-5 w-5" />
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px] font-bold uppercase tracking-wider">
              Academic Session
            </span>
            <span className="text-foreground font-extrabold text-sm mt-0.5 block">
              {batch?.academicSession?.name || "N/A"}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-3 bg-muted/40 p-4 rounded-xl border border-border/50 overflow-hidden">
          <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <IconMail className="h-5 w-5" />
          </div>
          <div className="overflow-hidden">
            <span className="text-muted-foreground block text-[10px] font-bold uppercase tracking-wider">
              Personal Email
            </span>
            <span className="text-foreground font-extrabold text-xs sm:text-sm mt-0.5 block truncate">
              {student.email}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-3 bg-muted/40 p-4 rounded-xl border border-border/50">
          <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <IconPhone className="h-5 w-5" />
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px] font-bold uppercase tracking-wider">
              Mobile Number
            </span>
            <span className="text-foreground font-extrabold text-sm mt-0.5 block">
              {student.phone || "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
