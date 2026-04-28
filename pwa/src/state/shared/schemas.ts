import { z } from "zod";

// ---------------------------------------------------------------------------
// Shared — matches RunRef DTO (embedded in participation responses)
// ---------------------------------------------------------------------------

export const runRefSchema = z.object({
  id: z.number(),
  startDate: z.string(),
  endDate: z.string(),
  edition: z.number().nullish(),
});

export type RunRef = z.infer<typeof runRefSchema>;

// ---------------------------------------------------------------------------
// Shared — matches UserRef DTO (embedded in participation responses)
// ---------------------------------------------------------------------------

export const userRefSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  surname: z.string().nullish(),
  image: z.string().nullish(),
});

export type UserRef = z.infer<typeof userRefSchema>;
