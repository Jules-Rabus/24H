import { z } from "zod"

export const raceMediaSchema = z.object({
  id: z.number().nullish(),
  filePath: z.string().nullish(),
  comment: z.string().nullish(),
  createdAt: z.string().nullish(),
})

export type RaceMedia = z.infer<typeof raceMediaSchema>
