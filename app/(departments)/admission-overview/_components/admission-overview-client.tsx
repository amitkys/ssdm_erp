"use client";

import { Clock, Loader2, UserCheck, UserX, Wallet } from "lucide-react";
import { useState } from "react";
import { ContentLayout } from "@/components/content-layout";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAdmissionOverviewFilterOptions,
  useAdmissionOverviewStats,
} from "../query/use-admission-overview";

const SEMESTER_OPTIONS = Array.from({ length: 8 }, (_, i) => String(i + 1));

export function AdmissionOverviewClient() {
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("");

  const { data: filterOptions, isLoading: isLoadingOptions } =
    useAdmissionOverviewFilterOptions();

  const { data: stats, isFetching: isFetchingStats } =
    useAdmissionOverviewStats(
      selectedSessionId,
      selectedSemester ? parseInt(selectedSemester, 10) : 0,
    );

  const hasFilters = !!selectedSessionId && !!selectedSemester;

  return (
    <ContentLayout title="Admission Overview">
      <div>
        {/* Filter Bar */}
        <Card className="mb-8 border-slate-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-bold text-slate-700 mb-2 block uppercase tracking-wide">
                  Session
                </p>
                <Select
                  value={selectedSessionId}
                  onValueChange={(val) => {
                    setSelectedSessionId(val);
                    setSelectedSemester("");
                  }}
                  disabled={isLoadingOptions}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select Session" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterOptions?.sessions.map((session) => (
                      <SelectItem key={session.id} value={session.id}>
                        {session.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-700 mb-2 block uppercase tracking-wide">
                  Semester
                </p>
                <Select
                  value={selectedSemester}
                  onValueChange={setSelectedSemester}
                  disabled={!selectedSessionId}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEMESTER_OPTIONS.map((semester) => (
                      <SelectItem key={semester} value={semester}>
                        Semester {semester}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stat Cards */}
        {hasFilters ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Successful Admissions */}
            <Card className="shadow-sm border-slate-200">
              <CardContent className="p-5 flex items-center space-x-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                  <UserCheck size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Successful Admissions
                  </p>
                  <div className="flex h-8 items-center">
                    {isFetchingStats ? (
                      <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                    ) : (
                      <p className="text-2xl font-black text-slate-800">
                        {stats?.successfulAdmissions ?? 0}
                      </p>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Students who paid the fee
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Fee Collected */}
            <Card className="shadow-sm border-slate-200">
              <CardContent className="p-5 flex items-center space-x-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                  <Wallet size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Fee Collected
                  </p>
                  <div className="flex h-8 items-center">
                    {isFetchingStats ? (
                      <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                    ) : (
                      <p className="text-2xl font-black text-slate-800">
                        ₹
                        {(stats?.totalFeeCollected ?? 0).toLocaleString(
                          "en-IN",
                        )}
                      </p>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Total fee for this semester
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Pending Admissions */}
            <Card className="shadow-sm border-slate-200">
              <CardContent className="p-5 flex items-center space-x-4">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
                  <Clock size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Pending Admissions
                  </p>
                  <div className="flex h-8 items-center">
                    {isFetchingStats ? (
                      <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                    ) : (
                      <p className="text-2xl font-black text-slate-800">
                        {stats?.pendingAdmissions ?? 0}
                      </p>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Students who have not paid
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <div className="p-4 bg-slate-100 rounded-full">
              <UserCheck size={28} className="text-slate-400" />
            </div>
            <p className="text-sm text-slate-500 font-medium">
              Select a session and semester to view admission stats
            </p>
          </div>
        )}
      </div>
    </ContentLayout>
  );
}
