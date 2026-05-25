"use client";

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { type NewSessionType, newSessionSchema } from "../lib/zod-type/new-session-type"
import { InputForSession } from "./input-for-session";

export const AddSession = () => {

  const form = useForm<NewSessionType>({
    resolver: zodResolver(newSessionSchema),
    defaultValues: {
      name: "",
      startDate: new Date(),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 2 + 1000 * 60 * 60 * 24), // 2 years and 1 day in future
    }
  })

  const onSubmit = (data: NewSessionType) => {
    console.log(data)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"secondary"} className="text-blue-900 font-bold cursor-pointer shadow-lg">New Session</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle className="font-semibold">Add New Session</DialogTitle>
            <DialogDescription>
              Add a new session here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center gap-5">
            <InputForSession form={form} />
          </div>
          <DialogFooter className="mt-5">
            <DialogClose asChild>
              <Button variant="outline" className="cursor-pointer">Cancel</Button>
            </DialogClose>
            <Button type="submit" className="cursor-pointer ">Submit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}