"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { approveCertificateRequest } from "../lib/actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconCheck, IconLoader2, IconAlertCircle } from "@tabler/icons-react";

interface CertificateReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: any | null;
}

const DIVISION_OPTIONS = [
  "1st Division",
  "2nd Division",
  "3rd Division",
  "Distinction",
  "Grade A",
  "Grade B",
  "Grade C",
  "Passed",
];

const BEHAVIOUR_OPTIONS = [
  "Good",
  "Very Good",
  "Excellent",
  "Outstanding",
  "Satisfactory",
];

export function CertificateReviewDialog({
  open,
  onOpenChange,
  request,
}: CertificateReviewDialogProps) {
  const queryClient = useQueryClient();
  const [division, setDivision] = useState("");
  const [behaviour, setBehaviour] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (request) {
      setDivision(request.division || "");
      setBehaviour(request.behaviour || "");
      setError(null);
    }
  }, [request]);

  const approveMutation = useMutation({
    mutationFn: async () => {
      if (!request) return;
      if (!division.trim()) throw new Error("Please select student division/grade.");
      if (!behaviour.trim()) throw new Error("Please select student conduct/behaviour.");

      const res = await approveCertificateRequest({
        requestId: request.id,
        division: division.trim(),
        behaviour: behaviour.trim(),
      });

      if (!res.success) {
        throw new Error(res.message);
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-certificate-requests"],
      });
      onOpenChange(false);
    },
    onError: (err: any) => {
      setError(err.message || "Failed to approve request.");
    },
  });

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Review Certificate Request
          </DialogTitle>
          <DialogDescription>
            Verify student details and select division & conduct remarks before approval.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <IconAlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Student Info Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500 font-medium">Student Name:</span>
                <p className="font-bold text-slate-800 text-sm">
                  {request.student?.name || "N/A"}
                </p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">College Roll:</span>
                <p className="font-mono font-bold text-slate-800 text-sm">
                  {request.student?.collegeRoll || "N/A"}
                </p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Certificate Type:</span>
                <p className="font-bold text-indigo-600 text-sm">
                  {request.certificate_type === "CLC"
                    ? "CLC + CHARACTER"
                    : request.certificate_type}
                </p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Amount Paid:</span>
                <p className="font-bold text-emerald-600 text-sm">
                  ₹{request.amount ?? request.certificate?.fee ?? 0}
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-200">
              <span className="text-slate-500 font-medium">Purpose:</span>
              <p className="font-medium text-slate-700">{request.purpose}</p>
            </div>
            <div className="pt-1">
              <span className="text-slate-500 font-medium">Passing Info:</span>
              <p className="font-medium text-slate-700">
                {request.passingMonth} {request.passingYear}
              </p>
            </div>
          </div>

          {/* Dropdowns for Division & Behaviour */}
          <div className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <Label className="font-semibold text-xs text-slate-700">
                Division / Grade <span className="text-rose-500">*</span>
              </Label>
              <Select value={division} onValueChange={setDivision}>
                <SelectTrigger className="rounded-xl h-10 text-sm">
                  <SelectValue placeholder="Select division / grade..." />
                </SelectTrigger>
                <SelectContent>
                  {DIVISION_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt} className="text-sm">
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="font-semibold text-xs text-slate-700">
                Student Conduct / Behaviour <span className="text-rose-500">*</span>
              </Label>
              <Select value={behaviour} onValueChange={setBehaviour}>
                <SelectTrigger className="rounded-xl h-10 text-sm">
                  <SelectValue placeholder="Select conduct / behaviour..." />
                </SelectTrigger>
                <SelectContent>
                  {BEHAVIOUR_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt} className="text-sm">
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl font-bold"
          >
            Cancel
          </Button>
          <Button
            onClick={() => approveMutation.mutate()}
            disabled={approveMutation.isPending || !division.trim() || !behaviour.trim()}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1"
          >
            {approveMutation.isPending ? (
              <>
                <IconLoader2 className="h-4 w-4 animate-spin" />
                Approving...
              </>
            ) : (
              <>
                <IconCheck className="h-4 w-4" />
                Approve Certificate
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
