"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { getDepartment } from "@/app/(departments)/department/query/get-all-department";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  type AddCourseSchema,
  addCourseSchema,
  COURSE_TYPES,
} from "../lib/zod-type/add-course-type";
import { useAddCourse } from "../query/mut-add-course";

const DURATION_OPTIONS = [2, 3, 4, 5, 6, 7, 8];

export function AddCourseSheet() {
  const [open, setOpen] = useState(false);
  const addCourse = useAddCourse();
  const { data: departments = [] } = useQuery(getDepartment());

  const form = useForm<AddCourseSchema>({
    resolver: zodResolver(addCourseSchema) as never,
    defaultValues: {
      name: "",
      code: "",
      type: "UG Regular",
      description: "",
      departmentId: "",
      duration: 4,
    },
  });

  async function onSubmit(values: AddCourseSchema) {
    try {
      await addCourse.mutateAsync(values);
      form.reset({
        name: "",
        code: "",
        type: "UG Regular",
        description: "",
        departmentId: "",
        duration: 4,
      });
      setOpen(false);
    } catch (err: any) {
      const errorMessage = err?.message || "";
      if (errorMessage.toLowerCase().includes("code")) {
        form.setError("code", { type: "manual", message: errorMessage });
      } else if (errorMessage.toLowerCase().includes("name")) {
        form.setError("name", { type: "manual", message: errorMessage });
      }
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <PlusIcon data-icon="inline-start" />
          Create Course
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex h-full flex-col gap-6"
        >
          <SheetHeader>
            <SheetTitle>Add Course</SheetTitle>
            <SheetDescription>
              Create a new course and link it to an existing department.
            </SheetDescription>
          </SheetHeader>

          <div className="grid flex-1 auto-rows-min gap-6 px-4">
            <div className="grid gap-3">
              <Controller
                control={form.control}
                name="departmentId"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel required>Department</FieldLabel>
                    <FieldContent>
                      <NativeSelect
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        aria-invalid={fieldState.invalid}
                        className="w-full"
                      >
                        <NativeSelectOption value="">
                          Select a department
                        </NativeSelectOption>
                        {departments.map((dept) => (
                          <NativeSelectOption key={dept.id} value={dept.id}>
                            {dept.name}
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel required>Course Name</FieldLabel>
                    <FieldContent>
                      <Input
                        placeholder="e.g. B.Sc. Physics"
                        {...field}
                        aria-invalid={fieldState.invalid}
                      />
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="code"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel required>Course Code</FieldLabel>
                    <FieldContent>
                      <Input
                        placeholder="e.g. BSC-PHY"
                        {...field}
                        aria-invalid={fieldState.invalid}
                      />
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="type"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel required>Course Type</FieldLabel>
                    <FieldContent>
                      <NativeSelect
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        aria-invalid={fieldState.invalid}
                        className="w-full"
                      >
                        {COURSE_TYPES.map((type) => (
                          <NativeSelectOption key={type} value={type}>
                            {type}
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="duration"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel required>Duration (Years)</FieldLabel>
                    <FieldContent>
                      <NativeSelect
                        value={String(field.value)}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        aria-invalid={fieldState.invalid}
                        className="w-full"
                      >
                        {DURATION_OPTIONS.map((dur) => (
                          <NativeSelectOption key={dur} value={String(dur)}>
                            {dur} {dur === 1 ? "Year" : "Years"}
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="description"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Description (optional)</FieldLabel>
                    <FieldContent>
                      <Input
                        placeholder="Optional course description"
                        {...field}
                        aria-invalid={fieldState.invalid}
                      />
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />
            </div>
          </div>

          {addCourse.error ? (
            <FieldError>{addCourse.error.message}</FieldError>
          ) : null}

          <SheetFooter>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Save"}
            </Button>
            <SheetClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </SheetClose>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
