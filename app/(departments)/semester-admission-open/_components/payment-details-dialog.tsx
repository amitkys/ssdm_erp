"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  IconCheck,
  IconX,
  IconSearch,
  IconReceipt,
  IconAlertCircle,
} from "@tabler/icons-react";

export interface StudentPaymentDetail {
  id: string;
  name: string;
  collegeRoll: string;
  paid: boolean;
  transactionId?: string;
  paidAt?: string;
}

interface PaymentDetailsDialogProps {
  semesterCount: number;
  sessionName: string;
  totalStudents: number;
  paidStudents: number;
  studentList: StudentPaymentDetail[];
}

export function PaymentDetailsDialog({
  semesterCount,
  sessionName,
  totalStudents,
  paidStudents,
  studentList,
}: PaymentDetailsDialogProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "paid" | "unpaid">("all");

  const percent =
    totalStudents > 0 ? Math.round((paidStudents / totalStudents) * 100) : 0;

  // Filter students based on search query and status filter
  const filteredStudents = studentList.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.collegeRoll.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      filter === "all" ||
      (filter === "paid" && student.paid) ||
      (filter === "unpaid" && !student.paid);

    return matchesSearch && matchesStatus;
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex flex-col gap-1.5 text-left group hover:opacity-85 transition-opacity focus:outline-none cursor-pointer"
        >
          <div className="flex items-center justify-between gap-6 text-[11px] font-bold tracking-tight">
            <span className="text-slate-400 group-hover:text-indigo-600 transition-colors">
              {paidStudents} of {totalStudents} Paid
            </span>
            <span className="text-slate-700 bg-slate-100 rounded-md px-1 py-0.5 font-mono">
              {percent}%
            </span>
          </div>
          <div className="w-28 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/40">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percent === 100
                  ? "bg-emerald-500"
                  : percent > 50
                    ? "bg-indigo-600"
                    : percent > 0
                      ? "bg-amber-500"
                      : "bg-slate-300"
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl bg-white border border-slate-100 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
        <DialogHeader className="space-y-1.5 pb-2">
          <DialogTitle className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <IconReceipt className="h-5 w-5 text-indigo-600" />
            Admission Fee Payments
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Semester {semesterCount} • Academic Session {sessionName}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Banner card */}
        <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-sm font-bold text-slate-700">
              Payment Collection Progress
            </div>
            <div className="text-xs text-slate-400 font-medium">
              {paidStudents} students completed their registration out of{" "}
              {totalStudents} total students.
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-2xl font-black text-slate-800">
                {percent}%
              </span>
            </div>
            <div className="h-10 w-10 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
              <IconCheck className="h-5 w-5 font-bold" />
            </div>
          </div>
        </div>

        {/* Search & Filter bar */}
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <IconSearch className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name or roll number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-slate-50 border-slate-200 focus-visible:bg-white text-xs"
            />
          </div>
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-1 gap-1">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                filter === "all"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilter("paid")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                filter === "paid"
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              Paid
            </button>
            <button
              type="button"
              onClick={() => setFilter("unpaid")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                filter === "unpaid"
                  ? "bg-white text-rose-600 shadow-sm"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              Unpaid
            </button>
          </div>
        </div>

        {/* Student list */}
        <ScrollArea className="h-[380px] mt-4 border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/50">
          {filteredStudents.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2 flex flex-col items-center">
              <IconAlertCircle className="h-8 w-8 text-slate-300" />
              <p className="text-sm font-bold">
                No students found matching your criteria
              </p>
              <p className="text-xs text-slate-400 font-semibold">
                Try modifying your filter or search input.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 p-2 space-y-1">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="bg-white border border-slate-100 rounded-xl p-3 flex items-center justify-between gap-4 shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-slate-800">
                      {student.name}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <span>Roll: {student.collegeRoll}</span>
                      {student.transactionId && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-[9px] lowercase text-slate-400 bg-slate-50 px-1 py-0.5 rounded border border-slate-200/50">
                            tx: {student.transactionId}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {student.paid ? (
                      <div className="flex flex-col items-end gap-1">
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20 rounded-lg text-[10px] font-bold">
                          <IconCheck className="h-3 w-3 inline mr-1" />
                          Paid
                        </Badge>
                        {student.paidAt && (
                          <span className="text-[9px] font-semibold text-slate-400">
                            {student.paidAt}
                          </span>
                        )}
                      </div>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-slate-100 text-slate-400 border-slate-200/50 rounded-lg text-[10px] font-bold"
                      >
                        <IconX className="h-3 w-3 inline mr-1" />
                        Unpaid
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
