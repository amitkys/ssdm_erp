'use client'
import { useQuery } from "@tanstack/react-query"
import { getSemesterWithSubjects } from "../query/get-semester-subject"
import { SubjectDetails } from "./subject-details-card"
import { Button } from "@/components/ui/button"
import { AddSubject } from "./add-subject"
import { FeeDetailsCard } from "./fee-details-card"
import { AddFee } from "./add-fee"

export const ListSubjects = ({ id }: { id: string }) => {

    const { data, isLoading, error } = useQuery(getSemesterWithSubjects({ id }))
    console.log(data?.fees)

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error: {error.message}</div>

    return (
        <>
            <div className="head flex flex-col justify-center items-center gap-1 py-2 bg-cyan-500">
                <h1 className="font-semibold text-xl">{data?.name}</h1>
                <div className="bnts flex justify-center items-center gap-5">
                    <AddSubject />
                    <AddFee />
                </div>
            </div>
            <div className="fees">
                {
                    data?.fees.map((fee) => {
                        return (
                            <FeeDetailsCard key={fee.id} fee={fee} />
                        )
                    })
                }
            </div>
            <hr className="bg-gray-300 h-1" />
            <div className="list">
                <ul className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 mt-5">
                    {
                        data?.semesterSubjects.map((semesterSubject) => {
                            return (
                                <SubjectDetails key={semesterSubject.subject.id} subject={semesterSubject.subject} />
                            )
                        })
                    }
                </ul>
            </div>
        </>
    )
}