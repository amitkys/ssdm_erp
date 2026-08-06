"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCertificateTypesQuery,
  getStudentCertificateRequestsQuery,
} from "../query/get-certificate-data";
import {
  requestCertificate,
  cancelCertificateRequest,
  initiateCertificatePayment,
} from "../lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  IconCertificate,
  IconCreditCard,
  IconX,
  IconLoader2,
  IconCheck,
  IconClock,
  IconAlertCircle,
  IconArrowRight,
} from "@tabler/icons-react";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function CertificatePageContent() {
  const queryClient = useQueryClient();
  const currentYear = new Date().getFullYear();

  // Generate 5 years back to 10 years forward
  const years: number[] = [];
  for (let i = currentYear - 5; i <= currentYear + 10; i++) {
    years.push(i);
  }

  const { data: certificateTypes, isLoading: isLoadingTypes } = useQuery(
    getCertificateTypesQuery(),
  );

  const { data: requestsData, isLoading: isLoadingRequests } = useQuery(
    getStudentCertificateRequestsQuery(),
  );

  const [selectedMetaId, setSelectedMetaId] = useState<string>("");
  const [purpose, setPurpose] = useState("");
  const [passingMonth, setPassingMonth] = useState("");
  const [passingYear, setPassingYear] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const requests = requestsData?.data || [];

  // Find selected certificate meta
  const selectedMeta = certificateTypes?.find((c) => c.id === selectedMetaId);

  // Check if selected type is already INITIATE or PENDING
  const isDuplicate = selectedMeta
    ? requests.some(
        (r) =>
          r.certificate_type === selectedMeta.certificate_type &&
          (r.status === "INITIATE" || r.status === "PENDING"),
      )
    : false;

  // Request & Pay Mutation — Creates request and immediately opens payment gateway
  const requestAndPayMutation = useMutation({
    mutationFn: async () => {
      if (!selectedMeta) throw new Error("Select a certificate type.");
      if (!purpose.trim()) throw new Error("Purpose is required.");
      if (!passingMonth) throw new Error("Select passing month.");
      if (!passingYear) throw new Error("Select passing year.");

      // 1. Create request record with INITIATE status
      const res = await requestCertificate({
        certificateId: selectedMeta.id,
        certificate_type: selectedMeta.certificate_type,
        purpose: purpose.trim(),
        passingMonth,
        passingYear,
      });

      if (!res.success || !res.requestId) {
        throw new Error(res.message || "Failed to create request.");
      }

      // 2. Immediately initiate payment gateway invoice
      const payRes = await initiateCertificatePayment(res.requestId);
      if (!payRes.success || !payRes.paymentUrl) {
        throw new Error(payRes.message || "Failed to open payment gateway.");
      }

      return payRes;
    },
    onSuccess: (payRes) => {
      queryClient.invalidateQueries({
        queryKey: ["student-certificate-requests"],
      });
      setSelectedMetaId("");
      setPurpose("");
      setPassingMonth("");
      setPassingYear("");
      setFormError(null);

      // Redirect browser directly to payment gateway
      if (payRes.paymentUrl) {
        window.location.href = payRes.paymentUrl;
      }
    },
    onError: (err: any) => {
      setFormError(err.message || "Failed to submit request.");
    },
  });

  // Cancel Mutation
  const cancelMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const res = await cancelCertificateRequest(requestId);
      if (!res.success) throw new Error(res.message);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["student-certificate-requests"],
      });
    },
    onError: (err: any) => {
      alert(err.message || "Failed to cancel request.");
    },
  });

  // Pay Now Mutation (for manually initiating payment on existing INITIATE rows)
  const payMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const res = await initiateCertificatePayment(requestId);
      if (!res.success) throw new Error(res.message);
      return res;
    },
    onSuccess: (res) => {
      if (res.paymentUrl) {
        window.location.href = res.paymentUrl;
      }
    },
    onError: (err: any) => {
      alert(err.message || "Failed to initiate payment.");
    },
  });

  const getLabelForType = (meta: { certificate_type: string; fee: number }) => {
    if (meta.certificate_type === "CLC") {
      return `CLC + CHARACTER (Fee: ₹${meta.fee})`;
    }
    return `${meta.certificate_type} (Fee: ₹${meta.fee})`;
  };

  return (
    <div className="space-y-8">
      {/* SECTION 1: REQUEST FORM */}
      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl bg-white dark:bg-slate-900">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700">
              <IconCertificate className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Request New Certificate
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Fill in your application details and proceed directly to fee payment.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {formError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl flex items-center gap-2">
              <IconAlertCircle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Certificate Type */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Certificate Type <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={selectedMetaId}
                onValueChange={(val) => {
                  setSelectedMetaId(val);
                  setFormError(null);
                }}
                disabled={isLoadingTypes}
              >
                <SelectTrigger className="rounded-xl h-10 text-xs font-medium">
                  <SelectValue placeholder="Choose certificate type..." />
                </SelectTrigger>
                <SelectContent>
                  {certificateTypes
                    ?.filter((meta) => meta.certificate_type !== "CHARACTER")
                    .map((meta) => (
                      <SelectItem key={meta.id} value={meta.id} className="text-xs">
                        {getLabelForType(meta)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Purpose */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Purpose <span className="text-rose-500">*</span>
              </Label>
              <Input
                placeholder="e.g. Higher Education, Job Application, Bank Loan"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="rounded-xl h-10 text-xs font-medium"
              />
            </div>

            {/* Passing Month */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Passing Month <span className="text-rose-500">*</span>
              </Label>
              <Select value={passingMonth} onValueChange={setPassingMonth}>
                <SelectTrigger className="rounded-xl h-10 text-xs font-medium">
                  <SelectValue placeholder="Select month..." />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m} value={m} className="text-xs">
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Passing Year */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Passing Year <span className="text-rose-500">*</span>
              </Label>
              <Select value={passingYear} onValueChange={setPassingYear}>
                <SelectTrigger className="rounded-xl h-10 text-xs font-medium">
                  <SelectValue placeholder="Select year..." />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)} className="text-xs">
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isDuplicate && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold rounded-xl flex items-center gap-2">
              <IconAlertCircle className="h-4 w-4 shrink-0" />
              <span>
                You already have an active request for this certificate type.
                Please pay or cancel the existing request before requesting again.
              </span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="text-xs text-slate-500 font-medium">
              {selectedMeta ? (
                <span>
                  Applicable Fee: <strong className="text-slate-800 dark:text-slate-200 font-bold">₹{selectedMeta.fee}</strong>
                </span>
              ) : (
                <span>Select a certificate type to view fee</span>
              )}
            </div>

            <Button
              onClick={() => requestAndPayMutation.mutate()}
              disabled={
                requestAndPayMutation.isPending ||
                !selectedMetaId ||
                !purpose.trim() ||
                !passingMonth ||
                !passingYear ||
                isDuplicate
              }
              className="rounded-xl px-5 h-10 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm gap-2"
            >
              {requestAndPayMutation.isPending ? (
                <>
                  <IconLoader2 className="h-4 w-4 animate-spin" />
                  Opening Payment Gateway...
                </>
              ) : (
                <>
                  <IconCreditCard className="h-4 w-4" />
                  Request & Pay Fee
                  <IconArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 2: MY REQUESTS TABLE */}
      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl bg-white dark:bg-slate-900 overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 py-4">
          <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100">
            My Certificate Requests
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Monitor application status and complete any pending fee payments.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoadingRequests ? (
            <div className="py-12 text-center text-muted-foreground flex items-center justify-center gap-2">
              <IconLoader2 className="h-5 w-5 animate-spin text-slate-400" />
              <span className="text-xs font-medium">Loading certificate requests...</span>
            </div>
          ) : requests.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-xs font-medium">
              No certificate requests submitted yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/60 dark:bg-slate-800/50">
                    <TableHead className="font-bold text-xs text-slate-700 dark:text-slate-300">
                      Certificate No.
                    </TableHead>
                    <TableHead className="font-bold text-xs text-slate-700 dark:text-slate-300">
                      Certificate Type
                    </TableHead>
                    <TableHead className="font-bold text-xs text-slate-700 dark:text-slate-300">
                      Purpose
                    </TableHead>
                    <TableHead className="font-bold text-xs text-slate-700 dark:text-slate-300">
                      Passing Info
                    </TableHead>
                    <TableHead className="font-bold text-xs text-slate-700 dark:text-slate-300">
                      Fee Amount
                    </TableHead>
                    <TableHead className="font-bold text-xs text-slate-700 dark:text-slate-300">
                      Status
                    </TableHead>
                    <TableHead className="font-bold text-xs text-slate-700 dark:text-slate-300 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((req) => {
                    const feeDisplay =
                      req.amount != null
                        ? `₹${req.amount}`
                        : `₹${req.certificate?.fee ?? 0}`;

                    return (
                      <TableRow key={req.id}>
                        <TableCell className="font-mono text-xs font-bold text-slate-700 dark:text-slate-200">
                          {req.certificate_No || "—"}
                        </TableCell>
                        <TableCell className="font-bold text-xs text-slate-800 dark:text-slate-100">
                          {req.certificate_type === "CLC"
                            ? "CLC + CHARACTER"
                            : req.certificate_type}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-xs text-slate-600 dark:text-slate-300 font-medium">
                          {req.purpose}
                        </TableCell>
                        <TableCell className="text-xs text-slate-500 font-mono">
                          {req.passingMonth} {req.passingYear}
                        </TableCell>
                        <TableCell className="font-bold text-xs text-slate-700 dark:text-slate-200">
                          {feeDisplay}
                        </TableCell>
                        <TableCell>
                          {req.status === "INITIATE" && (
                            <Badge
                              variant="outline"
                              className={
                                req.paymentStatus === "FAILED"
                                  ? "bg-rose-50 text-rose-700 border-rose-300 gap-1 text-[10px] font-bold"
                                  : "bg-amber-50 text-amber-700 border-amber-300 gap-1 text-[10px] font-bold"
                              }
                            >
                              {req.paymentStatus === "FAILED" ? (
                                <>
                                  <IconAlertCircle className="h-3 w-3" />
                                  Payment Failed — Retry
                                </>
                              ) : (
                                <>
                                  <IconClock className="h-3 w-3" />
                                  INITIATED (Unpaid)
                                </>
                              )}
                            </Badge>
                          )}
                          {req.status === "PENDING" && (
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-300 gap-1 text-[10px] font-bold"
                            >
                              <IconClock className="h-3 w-3" />
                              PENDING Approval
                            </Badge>
                          )}
                          {req.status === "APPROVED" && (
                            <Badge
                              variant="outline"
                              className="bg-emerald-50 text-emerald-700 border-emerald-300 gap-1 text-[10px] font-bold"
                            >
                              <IconCheck className="h-3 w-3" />
                              APPROVED
                            </Badge>
                          )}
                          {req.status === "CANCELLED" && (
                            <Badge
                              variant="outline"
                              className="bg-slate-100 text-slate-600 border-slate-300 gap-1 text-[10px] font-bold"
                            >
                              <IconX className="h-3 w-3" />
                              CANCELLED
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {req.status === "INITIATE" && (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                onClick={() => payMutation.mutate(req.id)}
                                disabled={
                                  payMutation.isPending || cancelMutation.isPending
                                }
                                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-7 text-xs font-bold gap-1"
                              >
                                {payMutation.isPending ? (
                                  <IconLoader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <IconCreditCard className="h-3 w-3" />
                                )}
                                Pay Now
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => cancelMutation.mutate(req.id)}
                                disabled={
                                  payMutation.isPending || cancelMutation.isPending
                                }
                                className="border-slate-300 text-slate-600 hover:bg-slate-100 rounded-lg h-7 text-xs font-bold gap-1"
                              >
                                {cancelMutation.isPending ? (
                                  <IconLoader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <IconX className="h-3 w-3" />
                                )}
                                Cancel
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
