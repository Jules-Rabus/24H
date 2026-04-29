import { z } from "zod";

// ---------------------------------------------------------------------------
// Read — matches ParticipationPublic DTO
// ---------------------------------------------------------------------------

export const publicParticipationSchema = z.object({
  id: z.number(),
  runId: z.number(),
  runStartDate: z.string(),
  runEndDate: z.string(),
  runEdition: z.number().nullish(),
  arrivalTime: z.string().nullish(),
  totalTime: z.number().nullish(),
  status: z.string(),
});

export type PublicParticipation = z.infer<typeof publicParticipationSchema>;

// ---------------------------------------------------------------------------
// Read — matches UserCollection DTO (public routes)
// ---------------------------------------------------------------------------

export const userCollectionSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  surname: z.string().nullish(),
  organization: z.string().nullish(),
  image: z.string().nullish(),
  participations: z.array(publicParticipationSchema),
  finishedParticipationsCount: z.number(),
  totalTime: z.number().nullish(),
  bestTime: z.number().nullish(),
  averageTime: z.number().nullish(),
});

export type PublicRunner = z.infer<typeof userCollectionSchema>;

export const rankedRunnerSchema = userCollectionSchema.extend({
  rank: z.number(),
});
export type RankedRunner = z.infer<typeof rankedRunnerSchema>;

export const editionStatsSchema = z.object({
  finishedCount: z.number(),
  distance: z.number(),
  bestTime: z.number().nullish(),
  averageTime: z.number().nullish(),
});
export type EditionStats = z.infer<typeof editionStatsSchema>;
