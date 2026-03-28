import { z } from "zod"

export const runSchema = z.object({
  id: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  participantsCount: z.number().optional(),
})

export const participationRunSchema = z.object({
  id: z.number().nullish(),
  startDate: z.string().nullish(),
  endDate: z.string().nullish(),
})

export const participationUserSchema = z.object({
  id: z.number().nullish(),
  firstName: z.string().nullish(),
  lastName: z.string().nullish(),
  surname: z.string().nullish(),
})

export const participationSchema = z.object({
  id: z.number().optional(),
  run: participationRunSchema.nullish(),
  user: participationUserSchema.nullish(),
  arrivalTime: z.string().nullish(),
  status: z.string().optional(),
  totalTime: z.number().nullish(),
})

export const runsCollectionSchema = z.object({
  member: z.array(runSchema),
  totalItems: z.number().optional(),
})

export const participationsCollectionSchema = z.object({
  member: z.array(participationSchema),
  totalItems: z.number().optional(),
})

export type Run = z.infer<typeof runSchema>
export type Participation = z.infer<typeof participationSchema>
export type RunsCollection = z.infer<typeof runsCollectionSchema>
export type ParticipationsCollection = z.infer<typeof participationsCollectionSchema>
