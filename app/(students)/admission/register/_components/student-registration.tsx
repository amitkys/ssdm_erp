'use client'
import { useQuery } from "@tanstack/react-query"
import { getEnrolledStudent } from "../query/get-enrolled-student"

export const StudentRegistration = ({UAN, sessionId, courseId}: {UAN: string, sessionId: string, courseId: string})=>{

  const {data, isLoading, error} = useQuery(getEnrolledStudent({UAN, sessionId, courseId}))

  return(
    <>
    </>
  )
}