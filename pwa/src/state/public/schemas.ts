import { z } from "zod";

// ---------------------------------------------------------------------------
// Read — matches ParticipationPublic DTO
// ---------------------------------------------------------------------------

export const publicParticipationSchema = z.object({
  id: z.number(),
  runId: z.number(),
  runStartDate: z.string(),
  runEndDate: z.string(),
  runEdition: z.number().nullable(),
  arrivalTime: z.string().nullable(),
  totalTime: z.number().nullable(),
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
  surname: z.string().nullable(),
  email: z.string().nullable(),
  organization: z.string().nullable(),
  image: z.string().nullable(),
  participations: z.array(publicParticipationSchema),
  finishedParticipationsCount: z.number(),
  totalTime: z.number().nullable(),
  bestTime: z.number().nullable(),
  averageTime: z.number().nullable(),
});

export type PublicRunner = z.infer<typeof userCollectionSchema>;

export const rankedRunnerSchema = userCollectionSchema.extend({
  rank: z.number(),
});
export type RankedRunner = z.infer<typeof rankedRunnerSchema>;

export const editionStatsSchema = z.object({
  finishedCount: z.number(),
  distance: z.number(),
  bestTime: z.number().nullable(),
  averageTime: z.number().nullable(),
});
export type EditionStats = z.infer<typeof editionStatsSchema>;
