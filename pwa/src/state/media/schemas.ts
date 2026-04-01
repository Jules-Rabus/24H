import { z } from "zod";

export const raceMediaSchema = z.object({
  id: z.number().nullish(),
  filePath: z.string().nullish(),
  contentUrl: z.string().nullish(),
  comment: z.string().nullish(),
  createdAt: z.string().nullish(),
  likesCount: z.number().default(0),
  contentType: z.string().nullish(),
});

export type RaceMedia = z.infer<typeof raceMediaSchema>;
