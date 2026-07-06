"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
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
import { useGetAcademicSessions } from "../query/get-academic-sessions";

interface SemesterAdmissionOpenFormFieldsProps {
  // biome-ignore lint/suspicious/noExplicitAny: form needs to accept both add and update schemas
  form: UseFormReturn<any>;
}

export function SemesterAdmissionOpenFormFields({
  form,
}: SemesterAdmissionOpenFormFieldsProps) {
  const { data: academicSessions = [], isPending } = useGetAcademicSessions();

  return (
    <div className="grid gap-3">
      <Controller
        control={form.control}
        name="academicSessionId"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel required>Academic Session</FieldLabel>
            <FieldContent>
              <NativeSelect
                value={field.value ?? ""}
                onChange={field.onChange}
                aria-invalid={fieldState.invalid}
                className="w-full"
                disabled={isPending}
              >
                <NativeSelectOption value="">
                  {isPending ? "Loading sessions..." : "Select Session"}
                </NativeSelectOption>
                {academicSessions.map((session) => (
                  <NativeSelectOption key={session.id} value={session.id}>
                    {session.name}
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
        name="semesterCount"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel required>Semester Number (1-8)</FieldLabel>
            <FieldContent>
              <Input
                type="number"
                min={1}
                max={8}
                placeholder="2"
                value={field.value ?? ""}
                onChange={(e) => field.onChange(Number(e.target.value))}
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </FieldContent>
          </Field>
        )}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Controller
          control={form.control}
          name="startDate"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel required>Start Date</FieldLabel>
              <FieldContent>
                <Input
                  type="date"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="endDate"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel required>End Date</FieldLabel>
              <FieldContent>
                <Input
                  type="date"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />
      </div>

      <Controller
        control={form.control}
        name="practicalFee"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Practical Fee (₹)</FieldLabel>
            <FieldContent>
              <Input
                type="number"
                min={0}
                placeholder="0"
                value={field.value ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  field.onChange(val === "" ? null : Number(val));
                }}
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </FieldContent>
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="lateFee"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Late Fee / Surcharge (₹)</FieldLabel>
            <FieldContent>
              <Input
                type="number"
                min={0}
                placeholder="0"
                value={field.value ?? 0}
                onChange={(e) => field.onChange(Number(e.target.value))}
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </FieldContent>
          </Field>
        )}
      />
    </div>
  );
}
