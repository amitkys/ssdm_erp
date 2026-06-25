"use client";

import { useMemo, useState } from "react";
import { useGetCourses } from "../query/get-courses";
import { AddCourseSheet } from "./add-course-sheet";
import { columns } from "./columns";
import { DataTable } from "./data-table";

export function CourseContent() {
  const [search, setSearch] = useState("");
  const { data: courses = [], isPending, isError, error } = useGetCourses();

  const filteredCourses = useMemo(() => {
    if (!search) {
      return courses;
    }

    const searchLower = search.toLowerCase();
    return courses.filter(
      (course) =>
        course.name.toLowerCase().includes(searchLower) ||
        course.code.toLowerCase().includes(searchLower) ||
        course.department.name.toLowerCase().includes(searchLower),
    );
  }, [courses, search]);

  if (isPending) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        Loading courses...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8 text-destructive">
        Error: {error?.message || "Failed to load courses"}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <AddCourseSheet />
      </div>
      <DataTable
        columns={columns}
        data={filteredCourses}
        onSearch={setSearch}
        search={search}
      />
    </div>
  );
}
