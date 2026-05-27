import { useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { newFeeSchema, NewFeeType } from "../lib/zod-type/fee-type"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { InputForFee } from "./input-for-fee"


export const AddFee = ()=>{
    
    const form = useForm<NewFeeType>({
        resolver: zodResolver(newFeeSchema),
        defaultValues: {
            institution: 0,
            university: 0,
            late: 0,
            practical: 0,
            cultural: 0,
            sports: 0,
            miscellaneous: 0,
        }
    })

    function onSubmit(data: NewFeeType) {
        console.log(data)
    }

    return (
        <Dialog>
      <DialogTrigger asChild>
        <Button variant={"secondary"} className="text-blue-900 font-bold cursor-pointer shadow-lg">New Fee</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle className="font-semibold">Add New Fee</DialogTitle>
            <DialogDescription>
              Add a new fee here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center gap-5 mt-5">
            <InputForFee form={form} />
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