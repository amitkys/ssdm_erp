"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  certificateTypeLabels,
  type CertificateType,
} from "../lib/zod-type/certificate-request-type";

export type CertificateRequestRow = {
  id: string;
  studentId: string;
  certificateType: string;
  fee: number;
  transactionId: string;
  purpose: string;
  status: string;
  behaviour: string | null;
  division: string | null;
  passingMonth: string | null;
  passingYear: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export const columns: ColumnDef<CertificateRequestRow>[] = [
  {
    accessorKey: "certificateType",
    header: "Certificate Type",
    cell: ({ row }) => {
      const type = row.original.certificateType as CertificateType;
      return (
        <span className="font-semibold text-foreground text-sm">
          {certificateTypeLabels[type] ?? type}
        </span>
      );
    },
  },
  {
    accessorKey: "fee",
    header: "Fee",
    cell: ({ row }) => (
      <span className="font-bold text-foreground tabular-nums">
        ₹{row.original.fee}
      </span>
    ),
  },
  {
    accessorKey: "transactionId",
    header: "Transaction ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground truncate max-w-[180px] block">
        {row.original.transactionId}
      </span>
    ),
  },
  {
    accessorKey: "purpose",
    header: "Purpose",
    cell: ({ row }) => (
      <span className="text-sm text-foreground max-w-[200px] truncate block">
        {row.original.purpose}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      if (status === "APPROVED") {
        return (
          <Badge
            variant="default"
            className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
          >
            Approved
          </Badge>
        );
      }
      return (
        <Badge
          variant="secondary"
          className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
        >
          Pending
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Applied On",
    cell: ({ row }) => (
      <span className="text-sm font-medium text-foreground">
        {format(new Date(row.original.createdAt), "PPP")}
      </span>
    ),
  },
];
