import { z } from "zod";

// ---------------------------------------------------------------------------
// Read — matches RunCollection DTO
// ---------------------------------------------------------------------------

export const runCollectionSchema = z.object({
  id: z.number(),
  startDate: z.string(),
  endDate: z.string(),
  participantsCount: z.number(),
  inProgressParticipantsCount: z.number(),
  finishedParticipantsCount: z.number(),
  averageTime: z.number().nullable(),
  fastestTime: z.number().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type AdminRun = z.infer<typeof runCollectionSchema>;

// ---------------------------------------------------------------------------
// Write — form validation schemas
// ---------------------------------------------------------------------------

export const createRunSchema = z
  .object({
    startDate: z.string().min(1, "Date de début requise"),
    endDate: z.string().min(1, "Date de fin requise"),
  })
  .refine((d) => new Date(d.endDate) > new Date(d.startDate), {
    message: "La fin doit être après le début",
    path: ["endDate"],
  });

export type CreateRunValues = z.infer<typeof createRunSchema>;

export const batchRunFormSchema = z
  .object({
    firstHour: z.string().min(1, "Heure de départ requise"),
    lastHour: z.string().min(1, "Heure de fin requise"),
  })
  .refine((d) => new Date(d.lastHour) > new Date(d.firstHour), {
    message: "Doit être après la première heure",
    path: ["lastHour"],
  });

export type BatchRunFormValues = z.infer<typeof batchRunFormSchema>;
