"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PencilIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
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
  type UpdateSemesterAdmissionOpenSchema,
  updateSemesterAdmissionOpenSchema,
} from "../lib/zod-type/semester-admission-open-type";
import type { useGetSemesterAdmissionOpens } from "../query/get-semester-admission-opens";
import { useUpdateSemesterAdmissionOpen } from "../query/mut-update-semester-admission-open";
import { SemesterAdmissionOpenFormFields } from "./semester-admission-open-form-fields";

export type SemesterAdmissionOpenRow = NonNullable<
  ReturnType<typeof useGetSemesterAdmissionOpens>["data"]
>[number];

interface EditSemesterAdmissionOpenSheetProps {
  record: SemesterAdmissionOpenRow;
}

export function EditSemesterAdmissionOpenSheet({
  record,
}: EditSemesterAdmissionOpenSheetProps) {
  const [open, setOpen] = useState(false);
  const updateMutation = useUpdateSemesterAdmissionOpen();

  const form = useForm<UpdateSemesterAdmissionOpenSchema>({
    // biome-ignore lint/suspicious/noExplicitAny: resolver bypass
    resolver: zodResolver(updateSemesterAdmissionOpenSchema) as any,
    defaultValues: {
      id: record.id,
      academicSessionId: record.academicSessionId,
      semesterCount: record.semesterCount,
      startDate: record.startDate,
      endDate: record.endDate,
      lateFee: record.lateFee ?? 0,
    },
  });

  async function onSubmit(values: UpdateSemesterAdmissionOpenSchema) {
    try {
      await updateMutation.mutateAsync(values);
      setOpen(false);
    } catch (_e) {
      // Handled by mutation error state
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          form.reset({
            id: record.id,
            academicSessionId: record.academicSessionId,
            semesterCount: record.semesterCount,
            startDate: record.startDate,
            endDate: record.endDate,
            lateFee: record.lateFee ?? 0,
          });
        }
        setOpen(nextOpen);
      }}
    >
      <SheetTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="h-8 gap-1">
          <PencilIcon className="size-3.5" />
          Edit
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex h-full flex-col gap-6"
        >
          <SheetHeader>
            <SheetTitle>Edit Semester Admission</SheetTitle>
            <SheetDescription>
              Update the timeline or late fees for this semester admission
              window.
            </SheetDescription>
          </SheetHeader>

          <div className="grid flex-1 auto-rows-min gap-6 px-4 overflow-y-auto">
            <div className="grid gap-3">
              <SemesterAdmissionOpenFormFields form={form} />
            </div>
          </div>

          {updateMutation.error ? (
            <FieldError>{updateMutation.error.message}</FieldError>
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
