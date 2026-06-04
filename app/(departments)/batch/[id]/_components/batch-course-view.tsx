"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpenIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CoinsIcon,
  GraduationCapIcon,
  LayersIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getBatchesByCourse } from "../query/get-batch";
import { cn } from "@/lib/utils";

interface BatchCourseViewProps {
  courseId: string;
}

export function BatchCourseView({ courseId }: BatchCourseViewProps) {
  const { data: course, isLoading, isError, error } = useQuery(
    getBatchesByCourse(courseId),
  );

  const [expandedBatch, setExpandedBatch] = useState<string | null>(null);
  const [expandedSemester, setExpandedSemester] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-4">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
        {error?.message ?? "Failed to load batches."}
      </div>
    );
  }

  if (!course) return null;

  const toggleBatch = (batchId: string) => {
    setExpandedBatch((prev) => (prev === batchId ? null : batchId));
    setExpandedSemester(null);
  };

  const toggleSemester = (semId: string) => {
    setExpandedSemester((prev) => (prev === semId ? null : semId));
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Course header */}
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <GraduationCapIcon className="size-5 text-muted-foreground" />
          <h1 className="text-xl font-semibold uppercase tracking-wide">
            {course.name}
          </h1>
          <Badge variant="secondary">{course.code}</Badge>
          <Badge variant="outline">{course.type}</Badge>
        </div>
        {course.description && (
          <p className="text-sm text-muted-foreground">{course.description}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Department of {course.department?.name} ·{" "}
          {course.duration} yr{course.duration > 1 ? "s" : ""} ·{" "}
          {course.duration * 2} semesters
        </p>
      </div>

      <Separator />

      {/* Batches */}
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Batches ({course.batches.length})
        </h2>

        {course.batches.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No batches found for this course.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {course.batches.map((batch) => {
              const isOpen = expandedBatch === batch.id;
              return (
                <div
                  key={batch.id}
                  className="rounded-2xl border bg-card shadow-sm"
                >
                  {/* Batch header — clickable */}
                  <button
                    type="button"
                    onClick={() => toggleBatch(batch.id)}
                    className="flex w-full items-center justify-between gap-4 rounded-2xl px-5 py-4 text-left transition-colors hover:bg-muted/50"
                  >
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="size-4 text-muted-foreground" />
                        <span className="text-sm font-semibold">
                          {batch.session?.name ?? "Unknown Session"}
                        </span>
                        <Badge
                          variant={
                            batch.session?.isActive ? "default" : "secondary"
                          }
                          className="text-[10px]"
                        >
                          {batch.session?.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="pl-6 text-xs text-muted-foreground">
                        {batch.semesters.length} semester
                        {batch.semesters.length !== 1 ? "s" : ""}
                        {batch.session?.startDate &&
                          ` · ${batch.session.startDate} → ${batch.session.endDate}`}
                      </p>
                    </div>
                    {isOpen ? (
                      <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
                    )}
                  </button>

                  {/* Semester list */}
                  {isOpen && (
                    <div className="flex flex-col gap-2 border-t px-5 pb-4 pt-3">
                      {batch.semesters.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No semesters found.
                        </p>
                      ) : (
                        batch.semesters.map((sem) => {
                          const semOpen = expandedSemester === sem.id;
                          const subjectCount = sem.semesterSubjects.length;
                          const totalFee = sem.fees.reduce(
                            (acc, f) =>
                              acc +
                              f.institution +
                              f.university +
                              f.late +
                              f.practical +
                              f.cultural +
                              f.sports +
                              f.miscellaneous,
                            0,
                          );

                          return (
                            <div
                              key={sem.id}
                              className="rounded-xl border bg-background"
                            >
                              {/* Semester header */}
                              <button
                                type="button"
                                onClick={() => toggleSemester(sem.id)}
                                className="flex w-full items-center justify-between gap-4 rounded-xl px-4 py-3 text-left transition-colors hover:bg-muted/40"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-medium">
                                    {sem.name}
                                  </span>
                                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <BookOpenIcon className="size-3" />
                                    {subjectCount} subject
                                    {subjectCount !== 1 ? "s" : ""}
                                  </span>
                                  {totalFee > 0 && (
                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <CoinsIcon className="size-3" />
                                      ₹{totalFee.toLocaleString("en-IN")}
                                    </span>
                                  )}
                                </div>
                                <ChevronDownIcon
                                  className={cn(
                                    "size-3.5 shrink-0 text-muted-foreground transition-transform",
                                    semOpen && "rotate-180",
                                  )}
                                />
                              </button>

                              {/* Semester details */}
                              {semOpen && (
                                <div className="flex flex-col gap-4 border-t px-4 pb-4 pt-3">
                                  {/* Subjects */}
                                  {subjectCount > 0 && (
                                    <div className="flex flex-col gap-2">
                                      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        <LayersIcon className="size-3" />
                                        Subjects
                                      </p>
                                      <div className="flex flex-wrap gap-2">
                                        {sem.semesterSubjects.map((ss) => (
                                          <div
                                            key={ss.id}
                                            className="flex items-center gap-1.5 rounded-lg border bg-muted/40 px-2.5 py-1.5"
                                          >
                                            <span className="text-xs font-medium">
                                              {ss.subject.name}
                                            </span>
                                            <Badge
                                              variant="secondary"
                                              className="text-[9px]"
                                            >
                                              {ss.subject.code}
                                            </Badge>
                                            {ss.subject.hasPractical && (
                                              <Badge
                                                variant="outline"
                                                className="text-[9px]"
                                              >
                                                Practical
                                              </Badge>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Fee breakdown */}
                                  {sem.fees.length > 0 && (
                                    <div className="flex flex-col gap-2">
                                      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        <CoinsIcon className="size-3" />
                                        Fee Breakdown
                                      </p>
                                      {sem.fees.map((fee) => {
                                        const rows = [
                                          { label: "Institution", value: fee.institution },
                                          { label: "University", value: fee.university },
                                          { label: "Practical", value: fee.practical },
                                          { label: "Cultural", value: fee.cultural },
                                          { label: "Sports", value: fee.sports },
                                          { label: "Miscellaneous", value: fee.miscellaneous },
                                          { label: "Late Fee", value: fee.late },
                                        ].filter((r) => r.value > 0);

                                        const feeTotal =
                                          fee.institution +
                                          fee.university +
                                          fee.late +
                                          fee.practical +
                                          fee.cultural +
                                          fee.sports +
                                          fee.miscellaneous;

                                        return (
                                          <div
                                            key={fee.id}
                                            className="overflow-hidden rounded-xl border"
                                          >
                                            <table className="w-full text-xs">
                                              <tbody>
                                                {rows.map((r) => (
                                                  <tr
                                                    key={r.label}
                                                    className="border-b last:border-0"
                                                  >
                                                    <td className="px-3 py-1.5 text-muted-foreground">
                                                      {r.label}
                                                    </td>
                                                    <td className="px-3 py-1.5 text-right font-medium">
                                                      ₹{r.value.toLocaleString("en-IN")}
                                                    </td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                              <tfoot>
                                                <tr className="bg-muted/40">
                                                  <td className="px-3 py-2 font-semibold">
                                                    Total
                                                  </td>
                                                  <td className="px-3 py-2 text-right font-semibold">
                                                    ₹{feeTotal.toLocaleString("en-IN")}
                                                  </td>
                                                </tr>
                                              </tfoot>
                                            </table>
                                          </div>
                                        );
                                      })}

                                      {sem.fees.length === 0 && (
                                        <p className="text-xs text-muted-foreground">
                                          No fee structure set.
                                        </p>
                                      )}
                                    </div>
                                  )}

                                  {subjectCount === 0 && sem.fees.length === 0 && (
                                    <p className="text-xs text-muted-foreground">
                                      No details added yet.
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
