import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { subjectTable } from '@/lib/db/schema/department'
import { ChevronRight } from "lucide-react"
import Link from "next/link"

export const SubjectDetails = ({ subject }: { subject: typeof subjectTable.$inferSelect }) => {

    return (
        <Card>
            <CardHeader className="flex justify-between">
                <CardTitle className="overflow-hidden text-ellipsis whitespace-nowrap">{subject.name}</CardTitle>
                <Link href={`#`} className="flex justify-center items-center cursor-pointer hover:underline text-cyan-600">
                    {subject.code}
                    <ChevronRight className=" h-6 w-6" />
                </Link>
            </CardHeader>

            <CardContent>

                <div className="flex justify-between items-center">
                    <CardDescription>Practical: {subject.hasPractical ? "Yes" : "No"}</CardDescription>
                    {subject.hasPractical && <CardDescription>Practical Fee: {subject.practicalFee}</CardDescription>}
                    <CardDescription>
                        {
                            subject.isActive ?
                                <Badge className="text-green-500 font-bold" variant={"secondary"}>
                                    Active
                                </Badge>
                                :
                                <Badge className="text-red-500 font-bold" variant={"destructive"}>
                                    Discontinue
                                </Badge>
                        }
                    </CardDescription>
                </div>
                
                <CardDescription className="mt-4">{subject.description}</CardDescription>
            </CardContent>
        </Card>
    )
} 