
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { getEnrolledStudent } from "./query/get-enrolled-student";


export default async function RegisterStudents(){

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(getEnrolledStudent({UAN, sessionId, courseId}));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* <Register /> */}
    </HydrationBoundary>
  )
} 