
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { getEnrolledStudent } from "./query/get-enrolled-student";
import { StudentRegistration } from "./_components/student-registration";


// Define the props interface where searchParams is a Promise
interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function RegisterStudents({ searchParams }: PageProps){


  // Await the searchParams promise to extract the parameters
  const resolvedParams = await searchParams;
  const sessionId = resolvedParams.sessionId as string;
  const courseId = resolvedParams.courseId as string;
  const UAN = resolvedParams.UAN as string; // Assuming UAN also comes from the query

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(getEnrolledStudent({UAN, sessionId, courseId}));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* <Register /> */}
      <StudentRegistration UAN={UAN} sessionId={sessionId} courseId={courseId} />
    </HydrationBoundary>
  )
} 