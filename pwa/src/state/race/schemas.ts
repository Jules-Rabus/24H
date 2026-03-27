import { z } from "zod"

export const runSchema = z.object({
  id: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  participantsCount: z.number().optional(),
})

export const participationSchema = z.object({
  id: z.number().optional(),
  run: z.string().nullish(),
  user: z.string().nullish(),
  arrivalTime: z.string().nullish(),
  status: z.string().optional(),
  totalTime: z.number().nullish(),
})

export const runsCollectionSchema = z.object({
  member: z.array(runSchema),
})

export const participationsCollectionSchema = z.object({
  member: z.array(participationSchema),
})

export type Run = z.infer<typeof runSchema>
export type Participation = z.infer<typeof participationSchema>
