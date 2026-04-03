import { z } from "zod";
import {
  runRefSchema,
  userRefSchema,
  type RunRef,
  type UserRef,
} from "@/state/shared/schemas";

export { runRefSchema, userRefSchema, type RunRef, type UserRef };

// ---------------------------------------------------------------------------
// Read — matches ParticipationCollection DTO
// ---------------------------------------------------------------------------

export const participationCollectionSchema = z.object({
  id: z.number(),
  run: runRefSchema,
  user: userRefSchema,
  arrivalTime: z.string().nullable(),
  totalTime: z.number().nullable(),
  status: z.string(),
});

export type AdminParticipation = z.infer<typeof participationCollectionSchema>;

// ---------------------------------------------------------------------------
// Write — form validation schemas
// ---------------------------------------------------------------------------

export const createParticipationSchema = z.object({
  userId: z.number({ error: "Coureur requis" }).min(1),
  runId: z.number({ error: "Run requis" }).min(1),
});

export type CreateParticipationValues = z.infer<
  typeof createParticipationSchema
>;

export const editParticipationSchema = z.object({
  arrivalTime: z.string(),
});

export type EditParticipationValues = z.infer<typeof editParticipationSchema>;
