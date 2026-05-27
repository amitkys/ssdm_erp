import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { getSemesterWithSubjects } from "./query/get-semester-subject";
import { ListSubjects } from "./_components/list-subjects";


export default async function SemesterByIdPage({params}: {params: Promise<{id: string}>}){

    const {id} = await params;
    const queryClient = new QueryClient()
    await queryClient.prefetchQuery(getSemesterWithSubjects({id}))


    return(
       <HydrationBoundary state={dehydrate(queryClient)}>
            <ListSubjects id={id}/>
        </HydrationBoundary>
    )
}