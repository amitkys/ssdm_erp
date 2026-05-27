import * as z from 'zod'

export const newFeeSchema = z.object({
    institution: z.number().min(1, 'Institution fee is required'),
    university: z.number().min(1, 'University fee is required'),
    late: z.number().min(0, 'Late fee cannot be negative'),
    practical: z.number().min(0, 'Practical fee cannot be negative'),
    cultural: z.number().min(0, 'Cultural fee cannot be negative'),
    sports: z.number().min(0, 'Sports fee cannot be negative'),
    miscellaneous: z.number().min(0, 'Miscellaneous fee cannot be negative'),
})

export type NewFeeType = z.infer<typeof newFeeSchema>