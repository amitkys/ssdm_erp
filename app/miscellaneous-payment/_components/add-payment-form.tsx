"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldError } from "@/components/ui/field";
import { PlusIcon } from "lucide-react";
import {
  type AddMiscPaymentSchema,
  addMiscPaymentSchema,
} from "../lib/zod-type/misc-payment-type";
import { useMutAddMiscPayment } from "../query/mut-add-misc-payment";
import { PaymentFormFields } from "./payment-form-fields";

interface AddPaymentFormProps {
  onPaymentCreated: (payment: {
    id: string;
    invoiceNumber: string;
    reason: string;
    name: string;
    amount: number;
    address: string;
    purpose: string;
    createdAt: Date;
  }) => void;
}

export function AddPaymentForm({ onPaymentCreated }: AddPaymentFormProps) {
  const mutation = useMutAddMiscPayment();

  const form = useForm<AddMiscPaymentSchema>({
    // biome-ignore lint/suspicious/noExplicitAny: resolver type needs to bypass RHF/Zod type mismatches due to z.coerce
    resolver: zodResolver(addMiscPaymentSchema) as any,
    defaultValues: {
      reason: "",
      name: "",
      amount: 0,
      address: "",
      purpose: "",
    },
  });

  async function onSubmit(values: AddMiscPaymentSchema) {
    try {
      const result = await mutation.mutateAsync(values);
      if (!result) return;
      toast.success(
        `Payment recorded! Invoice: ${result.invoiceNumber}`,
      );
      onPaymentCreated(result);
      form.reset({
        reason: "",
        name: "",
        amount: 0,
        address: "",
        purpose: "",
      });
    } catch (_e) {
      toast.error("Failed to save payment");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          New Miscellaneous Payment
        </CardTitle>
        <CardDescription>
          Fill in the details below. An invoice number will be auto-generated.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <PaymentFormFields form={form} />

          {mutation.error ? (
            <FieldError>{mutation.error.message}</FieldError>
          ) : null}

          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full sm:w-auto sm:self-end"
          >
            {form.formState.isSubmitting ? "Saving..." : "Save Payment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
