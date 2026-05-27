import { queryOptions } from "@tanstack/react-query"
import { fetchSemesterWithSubjects } from "../lib/action"

export function getSemesterWithSubjects ({id}: {id: string}){

     return queryOptions({
        queryKey: [
            'semester-subject',
            id
        ],
        queryFn: async () => {
            const res = await fetchSemesterWithSubjects(id)
            if(!res.success){
                throw new Error(res.message)
            }
            return res.data
        },
        retry: false,
    })
}