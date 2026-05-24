import * as z from 'zod'

export const newDepartmentSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters long").max(30, "Name cannot be more than 30 characters"),
    code: z.string().min(3, "Code must be at least 3 characters long").max(10, "Code cannot be more than 10 characters"),
    description: z.string().min(10, "Description must be at least 10 characters long").max(100, "Description cannot be more than 100 characters"),
})

export type NewDepartmentType = z.infer<typeof newDepartmentSchema>