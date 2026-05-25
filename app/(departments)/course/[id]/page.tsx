import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { getCourseWithSession } from "./query/get-course";
import { ListCourseSessions } from "./_components/list-course-sessions";

export default async function CourseByIdPage({params}: {params: Promise<{id: string}>}){
    const {id} = await params

    const queryClient = new QueryClient();
    await queryClient.prefetchQuery(getCourseWithSession({id}))

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ListCourseSessions id={id}/>
        </HydrationBoundary>
    )
}