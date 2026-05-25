import { queryOptions } from "@tanstack/react-query";
import { fetchCourseById } from "../lib/action";

export function getCourseWithSession({id}: {id: string}){

    return queryOptions({
        queryKey: [
            'course-session',
            id
        ],
        queryFn: async () => {
            const res = await fetchCourseById(id)
            if(!res.success){
                throw new Error(res.message)
            }
            return res.data
        },
        retry: false,
    })
}