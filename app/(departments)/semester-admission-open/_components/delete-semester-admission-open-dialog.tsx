"use client";

import { TrashIcon } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { useDeleteSemesterAdmissionOpen } from "../query/mut-delete-semester-admission-open";

interface DeleteSemesterAdmissionOpenDialogProps {
  id: string;
  semesterCount: number;
  sessionName: string;
}

export function DeleteSemesterAdmissionOpenDialog({
  id,
  semesterCount,
  sessionName,
}: DeleteSemesterAdmissionOpenDialogProps) {
  const [open, setOpen] = useState(false);
  const deleteMutation = useDeleteSemesterAdmissionOpen();

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(id);
      setOpen(false);
    } catch (_e) {
      // Handled by mutation error state
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-destructive hover:bg-destructive/10"
        >
          <TrashIcon className="size-3.5" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the admission open configuration for{" "}
            <span className="font-semibold text-foreground">
              Semester {semesterCount} ({sessionName})
            </span>
            . This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {deleteMutation.error && (
          <FieldError className="my-2">
            {deleteMutation.error.message}
          </FieldError>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">Cancel</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
