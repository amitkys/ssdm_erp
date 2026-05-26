import * as z from 'zod'

export const newSubjectSchema = z.object({
    name: z.string().min(3, "Subject name must be at least 3 characters").max(30, "Subject name must not be more than 30 characters"),
    code: z.string().min(3, "Subject code must be at least 3 characters").max(10, "Subject code must not be more than 10 characters"),
    description: z.string().min(10, "Subject description must be at least 10 characters").max(100, "Subject description must not be more than 100 characters"),
    hasPractical: z.boolean(),
    practicalFee: z.number(),
    // isActive: z.boolean(),
})

export type NewSubjectType = z.infer<typeof newSubjectSchema>
