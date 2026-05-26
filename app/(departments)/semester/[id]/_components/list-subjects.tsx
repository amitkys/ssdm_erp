'use client'
import { useQuery } from "@tanstack/react-query"
import { getSemesterWithSubjects } from "../query/get-semester-subject"
import { SubjectDetails } from "./subject-details-card"
import { Button } from "@/components/ui/button"
import { AddSubject } from "./add-subject"

export const ListSubjects = ({ id }: { id: string }) => {

    const { data, isLoading, error } = useQuery(getSemesterWithSubjects({ id }))
    console.log(data)

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error: {error.message}</div>

    return (
        <>
            <div className="head flex flex-col justify-center items-center gap-1 py-2 bg-cyan-500">
                <h1 className="font-semibold text-xl">{data?.name}</h1>
                {/* <Button>New Subject</Button> */}
                <AddSubject />
            </div>
            <div className="list">
                <ul className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 mt-5">
                    {
                        data?.semesterSubjects.map((semesterSubject) => {
                            return (
                                // <li key={semesterSubject.subject.id}>{semesterSubject.subject.name}</li>
                                <SubjectDetails key={semesterSubject.subject.id} subject={semesterSubject.subject}/>
                            )
                        })
                    }
                </ul>
            </div>
        </>
    )
}