"use client";

import { useMemo, useState } from "react";
import { useGetSemesterAdmissionOpens } from "../query/get-semester-admission-opens";
import { AddSemesterAdmissionOpenSheet } from "./add-semester-admission-open-sheet";
import { columns } from "./column";
import { DataTable } from "./data-table";

export function SemesterAdmissionOpenContent() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const {
    data: records = [],
    isPending,
    isError,
    error,
  } = useGetSemesterAdmissionOpens();

  const filteredRecords = useMemo(() => {
    let filtered = records;

    // Filter by academic session name or semester number
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((record) => {
        const sessionName = record.academicSession?.name || "";
        const semStr = `semester ${record.semesterCount}`;
        return (
          sessionName.toLowerCase().includes(searchLower) ||
          semStr.includes(searchLower) ||
          String(record.semesterCount).includes(searchLower)
        );
      });
    }

    // Filter by status (Scheduled, Open, Late Active)
    if (filterStatus) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      filtered = filtered.filter((record) => {
        const start = new Date(record.startDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(record.endDate);
        end.setHours(0, 0, 0, 0);

        let status = "";
        if (today < start) {
          status = "Scheduled";
        } else if (today > end) {
          status = "Late Active";
        } else {
          status = "Open";
        }

        return status === filterStatus;
      });
    }

    return filtered;
  }, [records, search, filterStatus]);

  if (isPending) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        Loading semester admissions...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8 text-destructive text-sm">
        Error: {error?.message || "Failed to load semester admission dates"}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <AddSemesterAdmissionOpenSheet />
      </div>
      <DataTable
        columns={columns}
        data={filteredRecords}
        onSearch={setSearch}
        onFilterStatus={setFilterStatus}
        search={search}
        filterStatus={filterStatus}
      />
    </div>
  );
}
