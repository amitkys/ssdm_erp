'use server'

import { db } from "@/lib/db"
import { EnrolledStudentTable } from "@/lib/db/schema/student"
import { and, eq } from "drizzle-orm"

export const fetchEnrolledStudent = async ({UAN, sessionId, courseId}: {UAN: string, sessionId: string, courseId: string})=>{
  try {
    const student = await db.query.EnrolledStudentTable.findFirst({
      where: and(eq(EnrolledStudentTable.UAN, UAN), eq(EnrolledStudentTable.courseSessionId, sessionId), eq(EnrolledStudentTable.courseId, courseId))
    })

    if(!student){
      return {
        success: false,
        message: "Student not found"
      }
    }

    return {
      success: true,
      data: student
    }

  } catch (error) {
    console.error("[fetchEnrolledStudent] Error:", error);
    return {
      success: false,
      message: "Internal Server Error during fetching enrolled student",
      error: error
    }
  }
}