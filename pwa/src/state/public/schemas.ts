import { z } from "zod";

export const publicRunnerSchema = z.object({
  id: z.number().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  surname: z.string().nullish(),
  organization: z.string().nullish(),
  image: z.string().nullish(),
  participations: z.array(z.number()).optional(),
  finishedParticipationsCount: z.number().optional(),
  totalTime: z.number().nullish(),
  bestTime: z.number().nullish(),
  averageTime: z.number().nullish(),
});

export type PublicRunner = z.infer<typeof publicRunnerSchema>;
