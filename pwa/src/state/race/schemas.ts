import { z } from "zod";
import {
  runRefSchema as participationRunSchema,
  userRefSchema as participationUserSchema,
} from "@/state/shared/schemas";

export { participationRunSchema, participationUserSchema };

// ---------------------------------------------------------------------------
// Read — matches RunCollection DTO (public subset)
// ---------------------------------------------------------------------------

export const runSchema = z.object({
  id: z.number(),
  startDate: z.string(),
  endDate: z.string(),
  participantsCount: z.number(),
  finishedParticipantsCount: z.number().nullish(),
  inProgressParticipantsCount: z.number().nullish(),
  averageTime: z.number().nullish(),
  fastestTime: z.number().nullish(),
});

// ---------------------------------------------------------------------------
// Read — matches ParticipationCollection DTO
// ---------------------------------------------------------------------------

export const participationSchema = z.object({
  id: z.number(),
  run: participationRunSchema,
  user: participationUserSchema,
  arrivalTime: z.string().nullish(),
  status: z.string(),
  totalTime: z.number().nullish(),
});

export const runsCollectionSchema = z.object({
  member: z.array(runSchema),
  totalItems: z.number().optional(),
});

export const participationsCollectionSchema = z.object({
  member: z.array(participationSchema),
  totalItems: z.number().optional(),
});

export type Run = z.infer<typeof runSchema>;
export type Participation = z.infer<typeof participationSchema>;
export type RunsCollection = z.infer<typeof runsCollectionSchema>;
export type ParticipationsCollection = z.infer<
  typeof participationsCollectionSchema
>;
