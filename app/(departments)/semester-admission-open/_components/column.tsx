"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { DeleteSemesterAdmissionOpenDialog } from "./delete-semester-admission-open-dialog";
import {
  EditSemesterAdmissionOpenSheet,
  type SemesterAdmissionOpenRow,
} from "./edit-semester-admission-open-sheet";

import { PaymentDetailsDialog } from "./payment-details-dialog";

export const columns: ColumnDef<SemesterAdmissionOpenRow>[] = [
  {
    accessorKey: "academicSession",
    header: "Academic Session",
    cell: ({ row }) => {
      const session = row.original.academicSession;
      return (
        <span className="font-semibold text-foreground">
          {session?.name ?? "N/A"}
        </span>
      );
    },
  },
  {
    accessorKey: "semesterCount",
    header: "Semester",
    cell: ({ row }) => {
      return (
        <span className="font-medium text-foreground">
          Semester {row.original.semesterCount}
        </span>
      );
    },
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) => {
      return (
        <span className="font-medium text-foreground">
          {format(new Date(row.original.startDate), "PPP")}
        </span>
      );
    },
  },
  {
    accessorKey: "endDate",
    header: "Deadline Date",
    cell: ({ row }) => {
      return (
        <span className="font-medium text-foreground">
          {format(new Date(row.original.endDate), "PPP")}
        </span>
      );
    },
  },
  {
    accessorKey: "lateFee",
    header: "Late Fee Surcharge",
    cell: ({ row }) => {
      const fee = row.original.lateFee ?? 0;
      return (
        <span className="font-mono text-muted-foreground">
          {fee > 0 ? `₹${fee}` : "No fee"}
        </span>
      );
    },
  },
  {
    accessorKey: "practicalFee",
    header: "Practical Fee",
    cell: ({ row }) => {
      const fee = row.original.practicalFee;
      return (
        <span className="font-mono text-muted-foreground">
          {fee != null && fee > 0 ? `₹${fee}` : "—"}
        </span>
      );
    },
  },
  {
    id: "paymentStatus",
    header: "Payment Status",
    cell: ({ row }) => {
      const record = row.original;
      return (
        <PaymentDetailsDialog
          semesterCount={record.semesterCount}
          sessionName={record.academicSession?.name ?? "N/A"}
          totalStudents={(record as any).totalStudents ?? 0}
          paidStudents={(record as any).paidStudents ?? 0}
          studentList={(record as any).studentList ?? []}
        />
      );
    },
  },
  {
    accessorKey: "status",
    header: "Admission Status",
    cell: ({ row }) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const record = row.original;
      const start = new Date(record.startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(record.endDate);
      end.setHours(0, 0, 0, 0);

      if (today < start) {
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
          >
            Scheduled
          </Badge>
        );
      } else if (today > end) {
        return (
          <Badge
            variant="default"
            className="bg-amber-500/10 text-amber-600 border-amber-500/20"
          >
            Late Fine Active
          </Badge>
        );
      } else {
        return (
          <Badge
            variant="default"
            className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
          >
            Open
          </Badge>
        );
      }
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const record = row.original;
      return (
        <div className="flex items-center gap-2">
          <EditSemesterAdmissionOpenSheet record={record} />
          <DeleteSemesterAdmissionOpenDialog
            id={record.id}
            semesterCount={record.semesterCount}
            sessionName={record.academicSession?.name ?? "N/A"}
          />
        </div>
      );
    },
  },
];
