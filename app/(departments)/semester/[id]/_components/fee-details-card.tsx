import { Card, CardDescription, CardHeader } from '@/components/ui/card'
import { feeTable } from '@/lib/db/schema/department'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button'
import { MoreHorizontalIcon } from 'lucide-react'

export const FeeDetailsCard = ({ fee }: { fee: typeof feeTable.$inferSelect }) => {
    return (
        <Card className=' my-5 mx-5'>

            <CardDescription>
                <Table>
                    <TableCaption className='text-xl font-semibold'>Fee Structure for this Semester</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px] text-center">Intitution Fee</TableHead>
                            <TableHead className="text-center">University Fee</TableHead>
                            <TableHead className="text-center">Late Fee</TableHead>
                            <TableHead className="text-center">Practical Fee</TableHead>
                            <TableHead className="text-center">Cultural Fee</TableHead>
                            <TableHead className="text-center">Sports Fee</TableHead>
                            <TableHead className="text-center">Miscellneous Fee</TableHead>
                            <TableHead className="text-center font-bold">Total Fee</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell className="font-medium text-center">{fee.institution}</TableCell>
                            <TableCell className="text-center">{fee.university}</TableCell>
                            <TableCell className="text-center">{fee.late}</TableCell>
                            <TableCell className="text-center">{fee.practical}</TableCell>
                            <TableCell className="text-center">{fee.cultural}</TableCell>
                            <TableCell className="text-center">{fee.sports}</TableCell>
                            <TableCell className="text-center">{fee.miscellaneous}</TableCell>
                            <TableCell className="text-center font-bold">
                                {
                                    fee.institution + fee.university + fee.late + fee.practical + fee.cultural + fee.sports + fee.miscellaneous
                                }
                            </TableCell>
                            <TableCell className="text-center">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="size-8">
                                            <MoreHorizontalIcon />
                                            <span className="sr-only">Open menu</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>Edit</DropdownMenuItem>
                                        <DropdownMenuItem variant="destructive">
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell> 
                        </TableRow>

                    </TableBody>
                    {/* <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right">$2,500.00</TableCell>
        </TableRow>
      </TableFooter> */}
                </Table>
            </CardDescription>
        </Card>
    )
}
