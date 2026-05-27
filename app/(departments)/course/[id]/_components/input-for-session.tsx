"use client";
import { Controller, type UseFormReturn } from "react-hook-form";
import { NewSessionType } from "../lib/zod-type/new-session-type"
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarSearch } from "lucide-react";

export const InputForSession = ({ form }: { form: UseFormReturn<NewSessionType> }) => {
  const [openStart, setOpenStart] = React.useState(false)
  const [openEnd, setOpenEnd] = React.useState(false)

  return (
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
        name="startDate"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel requiredLable>Start Date</FieldLabel>
            <FieldContent>
              <Popover open={openStart} onOpenChange={setOpenStart}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="startDate"
                    className="justify-between w-full font-normal"
                  >
                    {field.value ? new Date(field.value).toLocaleDateString() : "Select date"}
                    <CalendarSearch />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    defaultMonth={field.value}
                    captionLayout="dropdown"
                    onSelect={(date) => {
                      field.onChange(date)
                      setOpenStart(false)
                    }}
                  />
                </PopoverContent>
              </Popover>
              <FieldError errors={[fieldState.error]} />
            </FieldContent>
          </Field>
        )}
      />

      <Controller 
        control={form.control}
        name="endDate"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel requiredLable>End Date</FieldLabel>
            <FieldContent>
              <Popover open={openEnd} onOpenChange={setOpenEnd}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="endDate"
                    className="justify-between w-full font-normal"
                  >
                    {field.value ? new Date(field.value).toLocaleDateString() : "Select date"}
                    <CalendarSearch />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    defaultMonth={field.value}
                    captionLayout="dropdown"
                    onSelect={(date) => {
                      field.onChange(date)
                      setOpenEnd(false)
                    }}
                  />
                </PopoverContent>
              </Popover>
              <FieldError errors={[fieldState.error]} />
            </FieldContent>
          </Field>
        )}
      />
    </>
  )
}