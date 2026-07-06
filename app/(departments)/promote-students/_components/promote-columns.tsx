"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { useGetAdmittedStudentsBySession } from "@/app/(departments)/promote-students/query/get-admitted-students-by-session";
import { Badge } from "@/components/ui/badge";

export type AdmittedStudentRow = NonNullable<
  ReturnType<typeof useGetAdmittedStudentsBySession>["data"]
>[number];

export const promoteColumns: ColumnDef<AdmittedStudentRow>[] = [
  {
    accessorKey: "collegeRoll",
    header: "College Roll",
    cell: ({ row }) => (
      <div className="font-mono text-xs">{row.original.collegeRoll}</div>
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
  },
  {
    id: "course",
    header: "Course",
    cell: ({ row }) => (
      <div className="text-sm">
        <div>{row.original.batch.course.name}</div>
        <div className="text-xs text-muted-foreground">
          Session: {row.original.batch.academicSession.name}
        </div>
      </div>
    ),
  },
  {
    id: "department",
    header: "Department",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {row.original.batch.course.department.name}
      </div>
    ),
  },
  {
    accessorKey: "currentSemesterCount",
    header: "Current Semester",
    cell: ({ row }) => {
      const count = row.original.currentSemesterCount;
      const maxSem = row.original.batch.course.duration * 2;
      return (
        <div className="flex items-center gap-2">
          <span className="font-semibold">{count}</span>
          <span className="text-xs text-muted-foreground">/ {maxSem}</span>
        </div>
      );
    },
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const { isActive, isDetained, isPassed } = row.original;
      const maxSem = row.original.batch.course.duration * 2;
      const atMaxSem = row.original.currentSemesterCount >= maxSem;

      if (isPassed) {
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-600">
            Passed
          </Badge>
        );
      }
      if (isDetained) {
        return <Badge variant="destructive">Detained</Badge>;
      }
      if (!isActive) {
        return <Badge variant="secondary">Inactive</Badge>;
      }
      if (atMaxSem) {
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-600">
            Last Semester
          </Badge>
        );
      }
      return (
        <Badge className="bg-emerald-600 hover:bg-emerald-700">Eligible</Badge>
      );
    },
  },
];
