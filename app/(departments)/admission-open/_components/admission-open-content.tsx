"use client";

import { useMemo, useState } from "react";
import { useGetAdmissionOpens } from "../query/get-admission-opens";
import { AddAdmissionOpenSheet } from "./add-admission-open-sheet";
import { columns } from "./column";
import { DataTable } from "./data-table";

export function AdmissionOpenContent() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const {
    data: records = [],
    isPending,
    isError,
    error,
  } = useGetAdmissionOpens();

  const filteredRecords = useMemo(() => {
    let filtered = records;

    // Filter by course name or code
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((record) => {
        const course = record.batch?.course;
        if (!course) {
          return false;
        }
        return (
          course.name.toLowerCase().includes(searchLower) ||
          course.code.toLowerCase().includes(searchLower)
        );
      });
    }

    // Filter by status (Scheduled, Open, Closed)
    if (filterStatus) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      filtered = filtered.filter((record) => {
        const start = new Date(record.startDate);
        start.setHours(0, 0, 0, 0);

        const end =
          record.isDateExtended && record.extendedDate
            ? new Date(record.extendedDate)
            : new Date(record.endDate);
        end.setHours(0, 0, 0, 0);

        let status = "";
        if (today < start) {
          status = "Scheduled";
        } else if (today > end) {
          status = "Closed";
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
        Loading admission opens...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8 text-destructive text-sm">
        Error: {error?.message || "Failed to load admission open dates"}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <AddAdmissionOpenSheet />
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
