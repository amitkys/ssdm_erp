'use server'

import { db } from "@/lib/db"
import { EnrolledStudentTable } from "@/lib/db/schema"
import { and, eq } from "drizzle-orm"


export const fetchEnrolledStudent = async ({ UAN, batchId }: { UAN: string, batchId: string }) => {

  try {

    const student = await db.query.EnrolledStudentTable.findFirst({
      where: and(eq(EnrolledStudentTable.UAN, UAN), eq(EnrolledStudentTable.batchId, batchId))
    })

    if (!student) {
      return {
        success: false,
        message: "Student Not Found"
      }
    }

    return {
      success: true,
      isExist: true,
    }


  } catch (error) {

    return {
      success: false,
      message: "Internal Server Error, Failed to fetch enrolled student details"
    }
  }
}