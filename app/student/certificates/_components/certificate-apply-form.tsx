"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  IconCertificate,
  IconCurrencyRupee,
  IconSend,
} from "@tabler/icons-react";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  certificateTypeEnum,
  certificateTypeLabels,
  createCertificateRequestSchema,
  type CertificateType,
  type CreateCertificateRequestSchema,
} from "../lib/zod-type/certificate-request-type";
import { useMutAddCertificateRequest } from "../query/mut-add-certificate-request";

interface CertificateApplyFormProps {
  studentId: string;
  fees: {
    clcFee: number;
    characterFee: number;
    bonafideFee: number;
  };
}

/** Map certificate type → fee field key */
function getFeeForType(
  type: CertificateType,
  fees: CertificateApplyFormProps["fees"],
): number {
  switch (type) {
    case "CLC_CHARACTER":
      return fees.clcFee;
    case "CHARACTER":
      return fees.characterFee;
    case "BONAFIDE":
      return fees.bonafideFee;
  }
}

export function CertificateApplyForm({
  studentId,
  fees,
}: CertificateApplyFormProps) {
  const [selectedType, setSelectedType] = useState<CertificateType | "">("");
  const mutation = useMutAddCertificateRequest();

  const currentFee = selectedType ? getFeeForType(selectedType, fees) : 0;

  const form = useForm<CreateCertificateRequestSchema>({
    resolver: zodResolver(createCertificateRequestSchema),
    defaultValues: {
      studentId,
      certificateType: undefined,
      fee: 0,
      transactionId: "",
      purpose: "",
      behaviour: "",
      division: "",
      passingMonth: "",
      passingYear: "",
    },
  });

  function handleTypeChange(value: string) {
    const type = value as CertificateType;
    setSelectedType(type || "");
    if (type && certificateTypeEnum.includes(type)) {
      const fee = getFeeForType(type, fees);
      form.setValue("certificateType", type);
      form.setValue("fee", fee);
    } else {
      form.setValue("fee", 0);
    }
  }

  async function onSubmit(values: CreateCertificateRequestSchema) {
    try {
      await mutation.mutateAsync(values);
      toast.success("Certificate request submitted successfully!");
      form.reset();
      setSelectedType("");
    } catch (_e) {
      toast.error("Failed to submit certificate request");
    }
  }

  return (
    <div className="bg-white border border-slate-150 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
          <IconCertificate className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-800">
            Apply for Certificate
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Select a certificate type, enter details, and submit your
            application
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Certificate Type Dropdown */}
        <Field>
          <FieldLabel required>Certificate Type</FieldLabel>
          <FieldContent>
            <NativeSelect
              id="cert-type-select"
              value={selectedType}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="w-full"
            >
              <NativeSelectOption value="">
                -- Select Certificate --
              </NativeSelectOption>
              {certificateTypeEnum.map((type) => (
                <NativeSelectOption key={type} value={type}>
                  {certificateTypeLabels[type]} — ₹{getFeeForType(type, fees)}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            {form.formState.errors.certificateType && (
              <FieldError>
                {form.formState.errors.certificateType.message}
              </FieldError>
            )}
          </FieldContent>
        </Field>

        {/* Show the rest of the form only when a type is selected */}
        {selectedType && (
          <>
            {/* Fee Display */}
            <div className="flex items-center gap-2 p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl">
              <IconCurrencyRupee className="h-5 w-5 text-indigo-600" />
              <span className="text-sm font-bold text-indigo-800">
                Certificate Fee:
              </span>
              <span className="text-lg font-black text-indigo-700 tabular-nums">
                ₹{currentFee}
              </span>
            </div>

            {/* Purpose */}
            <Controller
              control={form.control}
              name="purpose"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel required>Purpose</FieldLabel>
                  <FieldContent>
                    <Textarea
                      placeholder="Why do you need this certificate?"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      aria-invalid={fieldState.invalid}
                      rows={2}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />

            {/* Transaction ID */}
            <Controller
              control={form.control}
              name="transactionId"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel required>Transaction ID</FieldLabel>
                  <FieldContent>
                    <Input
                      placeholder="Enter payment transaction ID"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />

            {/* Optional Fields Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Controller
                control={form.control}
                name="behaviour"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Behaviour</FieldLabel>
                    <FieldContent>
                      <Input
                        placeholder="e.g. Good"
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
                name="division"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Division</FieldLabel>
                    <FieldContent>
                      <Input
                        placeholder="e.g. First"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Controller
                control={form.control}
                name="passingMonth"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Passing Month</FieldLabel>
                    <FieldContent>
                      <Input
                        placeholder="e.g. June"
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
                name="passingYear"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Passing Year</FieldLabel>
                    <FieldContent>
                      <Input
                        placeholder="e.g. 2026"
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

            {/* Mutation Error */}
            {mutation.error ? (
              <FieldError>{mutation.error.message}</FieldError>
            ) : null}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={form.formState.isSubmitting || mutation.isPending}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.98] transition-all"
            >
              {form.formState.isSubmitting || mutation.isPending ? (
                "Submitting..."
              ) : (
                <>
                  <IconSend className="h-4 w-4 mr-2" />
                  Make Payment ₹{currentFee}
                </>
              )}
            </Button>
          </>
        )}
      </form>
    </div>
  );
}
