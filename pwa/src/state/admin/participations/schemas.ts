import { z } from "zod";

export const editParticipationSchema = z.object({
  arrivalTime: z.string().optional().default(""),
});

export type EditParticipationValues = z.infer<typeof editParticipationSchema>;

export const createParticipationSchema = z.object({
  userId: z.number({ error: "Coureur requis" }).min(1),
  runId: z.number({ error: "Run requis" }).min(1),
});

export type CreateParticipationValues = z.infer<
  typeof createParticipationSchema
>;
