import { z } from "zod";

export const publicParticipationSchema = z.object({
  id: z.number(),
  runId: z.number().nullish(),
  runStartDate: z.string().nullish(),
  runEndDate: z.string().nullish(),
  arrivalTime: z.string().nullish(),
  totalTime: z.number().nullish(),
  status: z.string(),
});

export type PublicParticipation = z.infer<typeof publicParticipationSchema>;

export const publicRunnerSchema = z.object({
  id: z.number().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  surname: z.string().nullish(),
  organization: z.string().nullish(),
  image: z.string().nullish(),
  participations: z.array(publicParticipationSchema).optional(),
  finishedParticipationsCount: z.number().optional(),
  totalTime: z.number().nullish(),
  bestTime: z.number().nullish(),
  averageTime: z.number().nullish(),
});

export type PublicRunner = z.infer<typeof publicRunnerSchema>;
