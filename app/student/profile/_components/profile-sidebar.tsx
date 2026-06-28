import {
  IconCalendar,
  IconId,
  IconMail,
  IconPhone,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { StudentProfile } from "../lib/types";

interface ProfileSidebarProps {
  student: StudentProfile;
}

export function ProfileSidebar({ student }: ProfileSidebarProps) {
  // Determine status
  const status = student.isDetained
    ? { label: "Detained", color: "bg-red-500" }
    : student.isPassed
      ? { label: "Passed", color: "bg-blue-500" }
      : student.isActive
        ? { label: "Active", color: "bg-emerald-500" }
        : { label: "Inactive", color: "bg-slate-400" };

  // Avatar initials
  const initials = student.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const photoUrl = student.documents?.photo || student.avatar;

  return (
    <Card className="w-full lg:w-[280px] lg:sticky lg:top-24 shrink-0 py-0 gap-0 overflow-hidden">
      {/* Header gradient strip */}
      <div className="h-20 bg-gradient-to-br from-primary/90 via-primary/70 to-primary/50" />

      {/* Avatar + Name section */}
      <div className="flex flex-col items-center -mt-10 px-5 pb-5">
        {/* Avatar */}
        <div className="relative">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={student.name}
              className="h-20 w-20 rounded-full border-4 border-card object-cover shadow-lg"
            />
          ) : (
            <div className="h-20 w-20 rounded-full border-4 border-card bg-primary/10 flex items-center justify-center shadow-lg">
              <span className="text-xl font-bold text-primary">{initials}</span>
            </div>
          )}
          {/* Status dot */}
          <span
            className={`absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-card ${status.color}`}
          />
        </div>

        {/* Name & Badge */}
        <h2 className="mt-3 text-base font-bold text-foreground text-center leading-tight">
          {student.name}
        </h2>
        <Badge
          variant="secondary"
          className={`mt-1.5 text-[10px] font-bold uppercase tracking-wider ${
            status.color === "bg-emerald-500"
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
              : status.color === "bg-red-500"
                ? "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
                : status.color === "bg-blue-500"
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                  : "bg-slate-100 text-slate-600"
          }`}
        >
          {status.label}
        </Badge>

        {/* Course info */}
        <p className="mt-2 text-xs font-medium text-primary text-center leading-snug max-w-[220px]">
          {student.batch?.course?.name || "—"}
        </p>
        <p className="text-[11px] text-muted-foreground font-medium">
          Semester {student.currentSemesterCount}
        </p>
      </div>

      <Separator />

      {/* Details list */}
      <div className="px-5 py-4 space-y-3.5">
        <SidebarItem
          icon={<IconId className="h-3.5 w-3.5" />}
          label="UAN"
          value={student.UAN}
        />
        <SidebarItem
          icon={<IconId className="h-3.5 w-3.5" />}
          label="College Roll"
          value={student.collegeRoll}
        />
        <SidebarItem
          icon={<IconCalendar className="h-3.5 w-3.5" />}
          label="DOB"
          value={
            student.DOB ? format(new Date(student.DOB), "dd MMM yyyy") : "—"
          }
        />
        <SidebarItem
          icon={<IconPhone className="h-3.5 w-3.5" />}
          label="Phone"
          value={student.phone}
        />
        <SidebarItem
          icon={<IconMail className="h-3.5 w-3.5" />}
          label="Email"
          value={student.email}
          truncate
        />

        <Separator className="my-1" />

        <SidebarItem
          icon={<IconUser className="h-3.5 w-3.5" />}
          label="Father"
          value={student.fathersName}
        />
        <SidebarItem
          icon={<IconUsers className="h-3.5 w-3.5" />}
          label="Mother"
          value={student.mothersName}
        />
      </div>
    </Card>
  );
}

function SidebarItem({
  icon,
  label,
  value,
  truncate = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
  truncate?: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 text-muted-foreground/60 shrink-0">{icon}</span>
      <div className="min-w-0">
        <span className="block text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider leading-none">
          {label}
        </span>
        <span
          className={`block text-xs font-semibold text-foreground mt-0.5 ${truncate ? "truncate" : ""}`}
        >
          {value || "—"}
        </span>
      </div>
    </div>
  );
}
