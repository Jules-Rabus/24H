import { z } from "zod";

// ---------------------------------------------------------------------------
// Shared — matches RunRef DTO (embedded in participation responses)
// ---------------------------------------------------------------------------

export const runRefSchema = z.object({
  id: z.number(),
  startDate: z.string(),
  endDate: z.string(),
});

export type RunRef = z.infer<typeof runRefSchema>;

// ---------------------------------------------------------------------------
// Shared — matches UserRef DTO (embedded in participation responses)
// ---------------------------------------------------------------------------

export const userRefSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  surname: z.string().nullable(),
  image: z.string().nullable(),
});

export type UserRef = z.infer<typeof userRefSchema>;
