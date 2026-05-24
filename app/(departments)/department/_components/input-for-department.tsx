"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import type { NewDepartmentType } from "../lib/zod-type/new-department-type";
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function InputForDepartment({
  form,
}: {
  form: UseFormReturn<NewDepartmentType>;
}){

    return(
        <>
        <Controller
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel requiredLable>Name</FieldLabel>
                <FieldContent>
                  <Input {...field} aria-invalid={fieldState.invalid} />
                  <FieldError errors={[fieldState.error]} />
                </FieldContent>
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="code"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel requiredLable>Code</FieldLabel>
                <FieldContent>
                  <Input {...field} aria-invalid={fieldState.invalid} />
                  <FieldError errors={[fieldState.error]} />
                </FieldContent>
              </Field>
            )}
          
          />

          <Controller
            control={form.control}
            name="description"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel requiredLable>Description</FieldLabel>
                <FieldContent>
                  <Input {...field} aria-invalid={fieldState.invalid} />
                  <FieldError errors={[fieldState.error]} />
                </FieldContent>
              </Field>
            )}
          
          />
        </>
    )
}