"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
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
  type AddSemesterAdmissionOpenSchema,
  addSemesterAdmissionOpenSchema,
} from "../lib/zod-type/semester-admission-open-type";
import { useAddSemesterAdmissionOpen } from "../query/mut-add-semester-admission-open";
import { SemesterAdmissionOpenFormFields } from "./semester-admission-open-form-fields";

export function AddSemesterAdmissionOpenSheet() {
  const [open, setOpen] = useState(false);
  const addMutation = useAddSemesterAdmissionOpen();

  const form = useForm<AddSemesterAdmissionOpenSchema>({
    // biome-ignore lint/suspicious/noExplicitAny: resolver bypass
    resolver: zodResolver(addSemesterAdmissionOpenSchema) as any,
    defaultValues: {
      academicSessionId: "",
      semesterCount: 2,
      startDate: "",
      endDate: "",
      practicalFee: null,
      lateFee: 0,
    },
  });

  async function onSubmit(values: AddSemesterAdmissionOpenSchema) {
    try {
      await addMutation.mutateAsync(values);
      form.reset({
        academicSessionId: "",
        semesterCount: 2,
        startDate: "",
        endDate: "",
        practicalFee: null,
        lateFee: 0,
      });
      setOpen(false);
    } catch (_e) {
      // Handled by mutation error state
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <PlusIcon data-icon="inline-start" />
          Open Semester Admission
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex h-full flex-col gap-6"
        >
          <SheetHeader>
            <SheetTitle>Open Semester Admission</SheetTitle>
            <SheetDescription>
              Set the timeline and late fees for promoting students to the next
              semester.
            </SheetDescription>
          </SheetHeader>

          <div className="grid flex-1 auto-rows-min gap-6 px-4 overflow-y-auto">
            <div className="grid gap-3">
              <SemesterAdmissionOpenFormFields form={form} />
            </div>
          </div>

          {addMutation.error ? (
            <FieldError>{addMutation.error.message}</FieldError>
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
