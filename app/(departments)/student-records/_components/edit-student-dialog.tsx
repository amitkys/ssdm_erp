"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PencilIcon } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  type EditStudentSchema,
  editStudentZodSchema,
} from "../lib/zod-type/edit-student-type";
import { useMutUpdateStudent } from "../query/mut-update-student";

interface EditStudentDialogProps {
  student: any;
}

export function EditStudentDialog({ student }: EditStudentDialogProps) {
  const [open, setOpen] = useState(false);
  const updateStudent = useMutUpdateStudent();

  // Convert DOB from Date to YYYY-MM-DD string if it's a Date object
  const formattedDOB = student.DOB
    ? typeof student.DOB === "string"
      ? student.DOB.split("T")[0]
      : new Date(student.DOB).toISOString().split("T")[0]
    : "";

  const form = useForm<EditStudentSchema>({
    resolver: zodResolver(editStudentZodSchema),
    defaultValues: {
      id: student.id,
      name: student.name || "",
      email: student.email || "",
      phone: student.phone || "",
      gender: student.gender || "Male",
      DOB: formattedDOB,
      AadharNumber: student.AadharNumber || "",
      ABCID: student.ABCID || "",
      fathersName: student.fathersName || "",
      mothersName: student.mothersName || "",
      religion: student.religion || "",
      caste: (student.caste as any) || "GEN",
      admissionType: (student.admissionType as any) || "MERIT",
      registrationNumber: student.registrationNumber || "",
      universityRoll: student.universityRoll || "",
      city: student.city || "",
      district: student.district || "",
      state: student.state || "",
      pinCode: student.pinCode ? Number(student.pinCode) : undefined,
    },
  });

  async function onSubmit(values: EditStudentSchema) {
    const { id, ...data } = values;
    await updateStudent.mutateAsync({ studentId: id, data });
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          form.reset({
            id: student.id,
            name: student.name || "",
            email: student.email || "",
            phone: student.phone || "",
            gender: student.gender || "Male",
            DOB: formattedDOB,
            AadharNumber: student.AadharNumber || "",
            ABCID: student.ABCID || "",
            fathersName: student.fathersName || "",
            mothersName: student.mothersName || "",
            religion: student.religion || "",
            caste: (student.caste as any) || "GEN",
            admissionType: (student.admissionType as any) || "MERIT",
            registrationNumber: student.registrationNumber || "",
            universityRoll: student.universityRoll || "",
            city: student.city || "",
            district: student.district || "",
            state: student.state || "",
            pinCode: student.pinCode ? Number(student.pinCode) : undefined,
          });
        }
        setOpen(nextOpen);
      }}
    >
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="flex items-center gap-1.5 border-emerald-600/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
        >
          <PencilIcon className="h-3.5 w-3.5" />
          Edit Student Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <DialogHeader>
            <DialogTitle>Edit Student Record</DialogTitle>
            <DialogDescription>
              Modify the student's personal, contact, and academic details.
              College Roll Number is read-only.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* College Roll (Disabled) */}
            <Field>
              <FieldLabel>College Roll Number</FieldLabel>
              <FieldContent>
                <Input
                  value={student.collegeRoll || ""}
                  disabled
                  className="bg-muted cursor-not-allowed opacity-75"
                />
              </FieldContent>
            </Field>

            {/* Name */}
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Full Name</FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      placeholder="Name"
                    />
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />

            {/* Email */}
            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Email Address</FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      type="email"
                      aria-invalid={fieldState.invalid}
                      placeholder="email@domain.com"
                    />
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />

            {/* Phone */}
            <Controller
              control={form.control}
              name="phone"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Phone Number</FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      placeholder="10-digit number"
                    />
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />

            {/* Gender */}
            <Controller
              control={form.control}
              name="gender"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Gender</FieldLabel>
                  <FieldContent>
                    <NativeSelect
                      {...field}
                      aria-invalid={fieldState.invalid}
                      className="w-full"
                    >
                      <NativeSelectOption value="Male">Male</NativeSelectOption>
                      <NativeSelectOption value="Female">
                        Female
                      </NativeSelectOption>
                      <NativeSelectOption value="Transgender">
                        Transgender
                      </NativeSelectOption>
                    </NativeSelect>
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />

            {/* DOB */}
            <Controller
              control={form.control}
              name="DOB"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Date of Birth</FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      type="date"
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />

            {/* Aadhar */}
            <Controller
              control={form.control}
              name="AadharNumber"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Aadhar Number</FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      placeholder="12-digit number"
                    />
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />

            {/* ABCID */}
            <Controller
              control={form.control}
              name="ABCID"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>ABC ID</FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      value={field.value || ""}
                      aria-invalid={fieldState.invalid}
                      placeholder="Academic Bank of Credits ID"
                    />
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />

            {/* Father's Name */}
            <Controller
              control={form.control}
              name="fathersName"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Father's Name</FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      placeholder="Father's Name"
                    />
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />

            {/* Mother's Name */}
            <Controller
              control={form.control}
              name="mothersName"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Mother's Name</FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      placeholder="Mother's Name"
                    />
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />

            {/* Religion */}
            <Controller
              control={form.control}
              name="religion"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Religion</FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      placeholder="e.g. Hindu, Muslim, Christian"
                    />
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />

            {/* Caste */}
            <Controller
              control={form.control}
              name="caste"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Caste / Category</FieldLabel>
                  <FieldContent>
                    <NativeSelect
                      {...field}
                      aria-invalid={fieldState.invalid}
                      className="w-full"
                    >
                      <NativeSelectOption value="GEN">
                        General (GEN)
                      </NativeSelectOption>
                      <NativeSelectOption value="BC">
                        Backward Class (BC)
                      </NativeSelectOption>
                      <NativeSelectOption value="EBC">
                        Extremely Backward Class (EBC)
                      </NativeSelectOption>
                      <NativeSelectOption value="SC">
                        Scheduled Caste (SC)
                      </NativeSelectOption>
                      <NativeSelectOption value="ST">
                        Scheduled Tribe (ST)
                      </NativeSelectOption>
                      <NativeSelectOption value="OTHER">
                        Other
                      </NativeSelectOption>
                    </NativeSelect>
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />

            {/* Admission Type */}
            <Controller
              control={form.control}
              name="admissionType"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Admission Type</FieldLabel>
                  <FieldContent>
                    <NativeSelect
                      {...field}
                      aria-invalid={fieldState.invalid}
                      className="w-full"
                    >
                      <NativeSelectOption value="MERIT">
                        Merit
                      </NativeSelectOption>
                      <NativeSelectOption value="SPORT">
                        Sport
                      </NativeSelectOption>
                      <NativeSelectOption value="MANAGEMENT QUOTA">
                        Management Quota
                      </NativeSelectOption>
                      <NativeSelectOption value="OTHER">
                        Other
                      </NativeSelectOption>
                    </NativeSelect>
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />

            {/* Registration Number */}
            <Controller
              control={form.control}
              name="registrationNumber"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Registration Number</FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      value={field.value || ""}
                      aria-invalid={fieldState.invalid}
                      placeholder="Reg Number"
                    />
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />

            {/* University Roll */}
            <Controller
              control={form.control}
              name="universityRoll"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>University Roll Number</FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      value={field.value || ""}
                      aria-invalid={fieldState.invalid}
                      placeholder="Univ Roll Number"
                    />
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />

            {/* City */}
            <Controller
              control={form.control}
              name="city"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>City</FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      placeholder="City"
                    />
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />

            {/* District */}
            <Controller
              control={form.control}
              name="district"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>District</FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      placeholder="District"
                    />
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />

            {/* State */}
            <Controller
              control={form.control}
              name="state"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>State</FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      placeholder="State"
                    />
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />

            {/* Pin Code */}
            <Controller
              control={form.control}
              name="pinCode"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Pin Code</FieldLabel>
                  <FieldContent>
                    <Input
                      type="number"
                      value={field.value === undefined ? "" : field.value}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : undefined,
                        )
                      }
                      aria-invalid={fieldState.invalid}
                      placeholder="6-digit PIN"
                    />
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting || updateStudent.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
            >
              {form.formState.isSubmitting || updateStudent.isPending
                ? "Saving..."
                : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
