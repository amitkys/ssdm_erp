import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { NewSubjectType, newSubjectSchema } from "../lib/zod-type/subject-type"
import { InputForSubject } from "./input-for-subject"


export const AddSubject = () => {


  const form = useForm<NewSubjectType>({
    resolver: zodResolver(newSubjectSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      hasPractical: false,
      practicalFee: 0,
      //   isActive: true,
    }
  })

  const onSubmit = (data: NewSubjectType) => {
    console.log(data)
  }


  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"secondary"} className="text-blue-900 font-bold cursor-pointer shadow-lg">New Subject</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle className="font-semibold">Add New Subject</DialogTitle>
            <DialogDescription>
              Add a new subject here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center gap-5 mt-5">
            <InputForSubject form={form} />
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