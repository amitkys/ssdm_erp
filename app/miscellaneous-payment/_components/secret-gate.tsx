"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { LockKeyholeIcon } from "lucide-react";
import { verifySecretCode } from "../lib/actions";

interface SecretGateProps {
  onSuccess: () => void;
}

export function SecretGate({ onSuccess }: SecretGateProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (!code.trim()) {
        setError("Please enter the secret code");
        return;
      }

      setLoading(true);
      try {
        const res = await verifySecretCode(code.trim());
        if (res.success) {
          sessionStorage.setItem("misc-payment-auth", "true");
          onSuccess();
        } else {
          setError(res.message ?? "Invalid secret code");
        }
      } catch {
        setError("Something went wrong. Try again.");
      } finally {
        setLoading(false);
      }
    },
    [code, onSuccess],
  );

  return (
    <Dialog open modal>
      <DialogContent showCloseButton={false} className="sm:max-w-sm">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <LockKeyholeIcon className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Access Required</DialogTitle>
          <DialogDescription className="text-center">
            Enter the secret code to access this page.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            type="password"
            placeholder="Enter secret code"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError(null);
            }}
            autoFocus
          />
          {error && <FieldError>{error}</FieldError>}
          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Verifying..." : "Unlock"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
