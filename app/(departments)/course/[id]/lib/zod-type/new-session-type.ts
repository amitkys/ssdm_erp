import * as z from 'zod'

export const newSessionSchema = z.object({
  name: z.string().min(3, 'Session name must be at least 3 characters long').max(30, 'Session name must be at most 30 characters long'),
  startDate: z.date().min(
    (() => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d;
    })(),
    'Start date must be at least today'
  ),
  endDate: z.date()
    .min(
      (() => {
        const d = new Date();
        d.setFullYear(d.getFullYear() + 2);
        d.setHours(0, 0, 0, 0);
        return d;
      })(),
      'End date must be at least 2 years from today'
    )
    .max(
      (() => {
        const d = new Date();
        d.setFullYear(d.getFullYear() + 4);
        d.setHours(23, 59, 59, 999);
        return d;
      })(),
      'End date must be at most 4 years from today'
    ),
})

export type NewSessionType = z.infer<typeof newSessionSchema>; 