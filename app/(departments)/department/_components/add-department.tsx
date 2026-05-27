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

import { useForm } from "react-hook-form"
import { type NewDepartmentType, newDepartmentSchema } from "../lib/zod-type/new-department-type"
import { zodResolver } from "@hookform/resolvers/zod"
import { InputForDepartment } from "./input-for-department"

export function AddDepartment() {

    const form = useForm<NewDepartmentType>({
        resolver: zodResolver(newDepartmentSchema),
        defaultValues: {
            name: "",
            code: "",
            description: ""
        }
    })

    const onSubmit = (data: NewDepartmentType)=>{
        console.log(data)
    }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"secondary"} className="text-blue-900 font-bold cursor-pointer shadow-lg">New Department</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle className="font-semibold">Add New Department</DialogTitle>
            <DialogDescription>
              Add a new department here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center gap-5">
            <InputForDepartment form={form}/>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
