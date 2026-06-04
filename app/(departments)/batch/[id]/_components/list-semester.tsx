'use client'
import { useQuery } from "@tanstack/react-query"
import { getBatchSemesters } from "../query/get-batch"
import Link from "next/link"

export const ListSemester = ({id}: {id: string})=>{

    const {data, isLoading, error} = useQuery(getBatchSemesters({id}))

    if(isLoading){
        return <div>Loading...</div>
    }
    if(error){ 
        return <div>Error: {error.message}</div>
    }

    return(
        <div className="flex flex-col gap-4 p-4">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-semibold">Semesters</h1>
                <p className="text-sm text-muted-foreground">
                    Auto-generated semesters for this course session.
                </p>
            </div>
            {data?.length ? (
                <div className="grid gap-2">
                    {data.map((semester) => {
                        const subjectsCount = semester.semesterSubjects.length
                        const totalFee = semester.fees.reduce((total, fee) => {
                            return (
                                total +
                                fee.institution +
                                fee.university +
                                fee.late +
                                fee.practical +
                                fee.cultural +
                                fee.sports +
                                fee.miscellaneous
                            )
                        }, 0)
                        return (
                            <details key={semester.id} className="rounded-md border px-3 py-2">
                                <summary className="flex cursor-pointer items-center justify-between text-sm font-medium">
                                    <span>{semester.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                        Subjects: {subjectsCount} • Total Fee: ₹{totalFee}
                                    </span>
                                </summary>
                                <div className="mt-2 text-sm text-muted-foreground">
                                    <Link
                                        href={`/semester/${semester.id}`}
                                        className="text-primary underline-offset-4 hover:underline"
                                    >
                                        View semester details
                                    </Link>
                                </div>
                            </details>
                        )
                    })}
                </div>
            ) : (
                <div className="text-sm text-muted-foreground">
                    No semesters found for this session.
                </div>
            )}
        </div>
    )
} 