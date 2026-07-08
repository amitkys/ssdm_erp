"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useGetAcademicSessions } from "@/app/(departments)/academic-session/query/get-academic-session";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import {
  type EnrollStudentInput,
  enrollStudentSchema,
} from "../lib/zod-type/enroll-student";
import { useGetActiveSubjects } from "../query/get-active-subjects";
import { useMutInsertEnrolledStudent } from "../query/mut-insert-enrolled-student";

// Helper to normalize name for comparison (removes B.A, B.Sc, B.Com, etc., and non-alphanumeric chars)
const getCleanedName = (name: string) => {
  return (
    name
      .toUpperCase()
      // Remove degree prefixes like B.A, B.Sc, B.Com, M.A, M.Sc, M.Com (with optional dots, spaces, or "in")
      .replace(
        /^(B\.?A\.?|B\.?SC\.?|B\.?COM\.?|M\.?A\.?|M\.?SC\.?|M\.?COM\.?)\s+(IN\s+)?/i,
        "",
      )
      // Remove all non-alphanumeric characters
      .replace(/[^A-Z0-9]/g, "")
      .trim()
  );
};

export function EnrollStudentPanel() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState<EnrollStudentInput | null>(null);

  // Queries & Mutations
  const { data: sessions = [], isPending: isSessionsLoading } =
    useGetAcademicSessions();
  const { data: subjects = [], isPending: isSubjectsLoading } =
    useGetActiveSubjects();
  const insertEnrolledStudentMutation = useMutInsertEnrolledStudent();

  const form = useForm<EnrollStudentInput>({
    // biome-ignore lint/suspicious/noExplicitAny: resolver type mismatch
    resolver: zodResolver(enrollStudentSchema) as any,
    defaultValues: {
      sessionId: "",
      batchId: "",
      subMJC: "",
      UAN: "",
      admissionType: "MERIT",
      registrationNumber: "",
      name: "",
      gender: undefined,
      reservation: "GEN",
      ABCID: "",
      caste: "",
      email: "",
      phone: "",
    },
  });

  const selectedSessionId = form.watch("sessionId");
  const selectedBatchId = form.watch("batchId");

  // Get batches matching selected session
  const batches = useMemo(() => {
    if (!selectedSessionId || !sessions) {
      return [];
    }
    const session = sessions.find((s) => s.id === selectedSessionId);
    return session?.batches || [];
  }, [selectedSessionId, sessions]);

  // Filter subjects for MJC (Major Course)
  const mjcSubjects = useMemo(() => {
    const filtered = subjects.filter(
      (s) =>
        s.code.toUpperCase().includes("MJC") ||
        s.name.toUpperCase().includes("MJC"),
    );
    return filtered.length > 0 ? filtered : subjects;
  }, [subjects]);

  // Auto-select MJC subject when batchId changes
  useEffect(() => {
    if (!selectedBatchId || batches.length === 0 || mjcSubjects.length === 0) {
      return;
    }

    const selectedBatch = batches.find((b) => b.id === selectedBatchId);
    if (!selectedBatch || !selectedBatch.course) {
      return;
    }

    const courseName = selectedBatch.course.name || "";
    const courseCode = selectedBatch.course.code || "";
    const deptName = selectedBatch.course.department?.name || "";
    const deptCode = selectedBatch.course.department?.code || "";

    const cleanedCourseName = getCleanedName(courseName);
    const cleanedCourseCode = getCleanedName(courseCode);
    const cleanedDeptName = getCleanedName(deptName);
    const cleanedDeptCode = getCleanedName(deptCode);

    let matchedSubjectId = "";

    // Pass 1: Try exact matching on cleaned course name or department name
    for (const s of mjcSubjects) {
      const cleanedSubjName = getCleanedName(s.name || "");
      if (
        (cleanedCourseName && cleanedSubjName === cleanedCourseName) ||
        (cleanedDeptName && cleanedSubjName === cleanedDeptName)
      ) {
        matchedSubjectId = s.id;
        break;
      }
    }

    // Pass 2: Try matching with cleaned codes (e.g. if code matches or contains)
    if (!matchedSubjectId) {
      for (const s of mjcSubjects) {
        const cleanedSubjCode = getCleanedName(s.code || "");
        if (
          (cleanedCourseCode && cleanedSubjCode.includes(cleanedCourseCode)) ||
          (cleanedDeptCode && cleanedSubjCode.includes(cleanedDeptCode)) ||
          cleanedCourseCode?.includes(cleanedSubjCode)
        ) {
          matchedSubjectId = s.id;
          break;
        }
      }
    }

    // Pass 3: Substring match (e.g. "PHYSICS" is in "B.Sc PHYSICS")
    if (!matchedSubjectId) {
      for (const s of mjcSubjects) {
        const cleanedSubjName = getCleanedName(s.name || "");
        if (
          cleanedCourseName?.includes(cleanedSubjName) ||
          (cleanedCourseName && cleanedSubjName.includes(cleanedCourseName)) ||
          cleanedDeptName?.includes(cleanedSubjName) ||
          (cleanedDeptName && cleanedSubjName.includes(cleanedDeptName))
        ) {
          matchedSubjectId = s.id;
          break;
        }
      }
    }

    if (matchedSubjectId) {
      form.setValue("subMJC", matchedSubjectId, { shouldValidate: true });
    }
  }, [selectedBatchId, batches, mjcSubjects, form]);

  // Clean batch field if session changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: reset when session changes
  useEffect(() => {
    form.setValue("batchId", "");
    form.setValue("subMJC", "");
  }, [selectedSessionId, form]);

  const handleFormSubmit = (data: EnrollStudentInput) => {
    setFormData(data);
    setShowConfirm(true);
  };

  const handleConfirmSave = async () => {
    if (!formData) {
      return;
    }
    setShowConfirm(false);

    try {
      await insertEnrolledStudentMutation.mutateAsync(formData);

      // Save succeeded! Clean form except session, batch, and subject
      form.reset({
        sessionId: formData.sessionId,
        batchId: formData.batchId,
        subMJC: formData.subMJC,
        UAN: "",
        admissionType: "MERIT",
        registrationNumber: "",
        name: "",
        gender: undefined,
        reservation: "GEN",
        ABCID: "",
        caste: "",
        email: "",
        phone: "",
      });
      setFormData(null);
    } catch (_error) {
      // Error is already handled by toast in mutation query
    }
  };

  return (
    <div className="grid gap-6">
      <form onSubmit={form.handleSubmit(handleFormSubmit)}>
        <Card className="shadow-lg border border-border/60">
          <CardHeader>
            <CardTitle>Enrolled Student Details</CardTitle>
            <CardDescription>
              First select the academic session and batch, then fill in the
              enrolled student details.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            {/* Step 1: Academic & Batch Info */}
            <div className="rounded-xl border border-muted p-4 bg-muted/20">
              <h2 className="text-base font-semibold mb-4 text-foreground/90">
                Academic Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Controller
                  control={form.control}
                  name="sessionId"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel required>Academic Session</FieldLabel>
                      <FieldContent>
                        <NativeSelect
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          aria-invalid={fieldState.invalid}
                          disabled={isSessionsLoading}
                        >
                          <option value="">
                            {isSessionsLoading
                              ? "Loading sessions..."
                              : "Select Session"}
                          </option>
                          {sessions.map((sess) => (
                            <option key={sess.id} value={sess.id}>
                              {sess.name}
                            </option>
                          ))}
                        </NativeSelect>
                        <FieldError errors={[fieldState.error]} />
                      </FieldContent>
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="batchId"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel required>Batch / Course</FieldLabel>
                      <FieldContent>
                        <NativeSelect
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          aria-invalid={fieldState.invalid}
                          disabled={!selectedSessionId}
                        >
                          <option value="">
                            {!selectedSessionId
                              ? "Select session first"
                              : "Select Batch"}
                          </option>
                          {batches.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.course.name} (Fee: ₹{b.perSemesterFee})
                            </option>
                          ))}
                        </NativeSelect>
                        <FieldError errors={[fieldState.error]} />
                      </FieldContent>
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="subMJC"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel required>Major Subject (MJC)</FieldLabel>
                      <FieldContent>
                        <NativeSelect
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          aria-invalid={fieldState.invalid}
                          disabled={isSubjectsLoading || !selectedBatchId}
                        >
                          <option value="">
                            {isSubjectsLoading
                              ? "Loading subjects..."
                              : !selectedBatchId
                                ? "Select batch first"
                                : "Select MJC Subject"}
                          </option>
                          {mjcSubjects.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.code})
                            </option>
                          ))}
                        </NativeSelect>
                        <FieldError errors={[fieldState.error]} />
                      </FieldContent>
                    </Field>
                  )}
                />
              </div>
            </div>

            {/* Step 2: Student Details Form */}
            <div className="grid gap-6">
              <h2 className="text-base font-semibold text-foreground/90 border-b pb-2">
                Personal & Admission Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* UAN */}
                <Controller
                  control={form.control}
                  name="UAN"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel required>UAN / Form Number</FieldLabel>
                      <FieldContent>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          aria-invalid={fieldState.invalid}
                          placeholder="Ex: UAN20261009"
                        />
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
                      <FieldLabel required>Admission Type</FieldLabel>
                      <FieldContent>
                        <NativeSelect
                          value={field.value ?? "MERIT"}
                          onChange={field.onChange}
                          aria-invalid={fieldState.invalid}
                        >
                          <option value="MERIT">MERIT</option>
                          <option value="SPORT">SPORT</option>
                          <option value="MANAGEMENT QUOTA">
                            MANAGEMENT QUOTA
                          </option>
                          <option value="OTHER">OTHER</option>
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
                      <FieldLabel required>Registration Number</FieldLabel>
                      <FieldContent>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          aria-invalid={fieldState.invalid}
                          placeholder="Ex: REG20260089"
                        />
                        <FieldError errors={[fieldState.error]} />
                      </FieldContent>
                    </Field>
                  )}
                />

                {/* Student Name */}
                <Controller
                  control={form.control}
                  name="name"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel required>Student Name</FieldLabel>
                      <FieldContent>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          aria-invalid={fieldState.invalid}
                          placeholder="Enter student full name"
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
                      <FieldLabel required>Gender</FieldLabel>
                      <FieldContent>
                        <NativeSelect
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          aria-invalid={fieldState.invalid}
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Transgender">Transgender</option>
                        </NativeSelect>
                        <FieldError errors={[fieldState.error]} />
                      </FieldContent>
                    </Field>
                  )}
                />

                {/* Reservation */}
                <Controller
                  control={form.control}
                  name="reservation"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel required>Reservation Category</FieldLabel>
                      <FieldContent>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          aria-invalid={fieldState.invalid}
                          placeholder="Ex: GEN, OBC, Sports, PH, None"
                        />
                        <FieldError errors={[fieldState.error]} />
                      </FieldContent>
                    </Field>
                  )}
                />

                {/* ABC ID */}
                <Controller
                  control={form.control}
                  name="ABCID"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>ABC ID (Optional)</FieldLabel>
                      <FieldContent>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          aria-invalid={fieldState.invalid}
                          placeholder="12-digit Academic Bank of Credits ID"
                        />
                        <FieldError errors={[fieldState.error]} />
                      </FieldContent>
                    </Field>
                  )}
                />

                {/* Caste (dropdown) */}
                <Controller
                  control={form.control}
                  name="caste"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Caste (Optional)</FieldLabel>
                      <FieldContent>
                        <NativeSelect
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          aria-invalid={fieldState.invalid}
                        >
                          <option value="">Select Caste Category</option>
                          <option value="GEN">GEN (General)</option>
                          <option value="BC">BC (Backward Class)</option>
                          <option value="EBC">
                            EBC (Extremely Backward Class)
                          </option>
                          <option value="SC">SC (Scheduled Caste)</option>
                          <option value="ST">ST (Scheduled Tribe)</option>
                          <option value="OTHER">OTHER</option>
                        </NativeSelect>
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
                      <FieldLabel>Email (Optional)</FieldLabel>
                      <FieldContent>
                        <Input
                          type="email"
                          {...field}
                          value={field.value ?? ""}
                          aria-invalid={fieldState.invalid}
                          placeholder="student@example.com"
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
                      <FieldLabel>Phone Number (Optional)</FieldLabel>
                      <FieldContent>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          aria-invalid={fieldState.invalid}
                          placeholder="10-digit mobile number"
                        />
                        <FieldError errors={[fieldState.error]} />
                      </FieldContent>
                    </Field>
                  )}
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-3 border-t bg-muted/5 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                form.reset({
                  sessionId: "",
                  batchId: "",
                  subMJC: "",
                  UAN: "",
                  admissionType: "MERIT",
                  registrationNumber: "",
                  name: "",
                  gender: undefined,
                  reservation: "GEN",
                  ABCID: "",
                  caste: "",
                  email: "",
                  phone: "",
                })
              }
            >
              Reset All
            </Button>
            <Button
              type="submit"
              disabled={insertEnrolledStudentMutation.isPending}
            >
              {insertEnrolledStudentMutation.isPending
                ? "Enrolling..."
                : "Enroll Student"}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* Warning Confirmation Alert Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive font-semibold">
              Warning: Confirm Enrolled Student Save
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to save this enrolled student's details?
              Please double-check all unique details (UAN, Registration Number,
              ABC ID, and Email) as duplicate values will cause verification
              conflicts and cannot be easily changed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline">Go Back</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                onClick={handleConfirmSave}
                className="bg-destructive hover:bg-destructive/95 text-destructive-foreground"
              >
                Confirm & Save
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
