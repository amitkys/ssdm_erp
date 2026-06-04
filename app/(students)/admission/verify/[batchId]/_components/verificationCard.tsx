'use client'

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VerifyStudentUANType, verifyStudentUANZodSchema } from '../lib/zod-type/verify-student-uan'
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputForVerification } from "./input-for-verification";
import { useMutation } from "@tanstack/react-query";
import { verifyEnrolledStudentMutationOptions } from "../query/verify-enrolled-student";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export const VerificationCard = ({ batchId }: { batchId: string }) => {
  const router = useRouter();
  const form = useForm<VerifyStudentUANType>({
    resolver: zodResolver(verifyStudentUANZodSchema),
    defaultValues: {
      uan: "",
      email: "",
    }
  })

  const [uan, setUan] = useState("")
  const { mutate, isPending, isSuccess, isError, error } = useMutation({
    ...verifyEnrolledStudentMutationOptions(batchId),
  });

  const onSubmit = (data: VerifyStudentUANType) => {
    setUan(data.uan);
    mutate(data.uan);
  }

  useEffect(() => {
    if (isSuccess) {
      router.push(`/admission/register?batch=${batchId}&uan=${uan}`);
    }
  }, [isSuccess, router, batchId, uan]);


  return (
    <Card className="max-w-[600px] mx-auto w-full">
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="text-center text-lg">Please Verify your identity to proceed with the admission process</CardTitle>
          </CardHeader>

          <InputForVerification form={form} />

          {isSuccess && (
            <p className="text-sm text-green-600 mt-2">Student verified successfully!</p>
          )}
          {isError && (
            <p className="text-sm text-destructive mt-2">{error.message}</p>
          )}

          <div className="flex justify-end mt-4 gap-4">
            <Button onClick={() => form.reset()} disabled={isPending}>
              Reset
            </Button>
            <Button type="submit" disabled={isPending}>
              Verify
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

