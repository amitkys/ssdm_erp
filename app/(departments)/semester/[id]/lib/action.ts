'use server'

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { semesterSubjectTable, semesterTable, subjectTable } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";

export async function fetchSemesterWithSubjects(semesterId: string){
    try {

        const session = await auth.api.getSession({headers: await headers()})
        if(!session){
            return {success: false, message: "Unauthorized"}
        }
        if(session.user.role !== "admin"){
            return {success: false, message: "You are not authorized to access"}
        }

        const semester = await db.query.semesterTable.findFirst({
            where: eq(semesterTable.id, semesterId),
            with:{
                fees: true,
                semesterSubjects: {
                    with:{
                        subject: true
                    }
                }
            }
        });
        if (!semester) return { success: false, message: "Semester not found" }
        return {
            success: true,
            data: semester,
        }

    } catch (error) {
        return {
            success: false,
            message: "Failed to fetch semester",
            error: error,
        }
    }
}
