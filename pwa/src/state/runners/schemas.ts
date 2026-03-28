import { z } from "zod";

export const runnerSchema = z.object({
  id: z.number().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  surname: z.string().nullish(),
  email: z.string().nullish(),
  organization: z.string().nullish(),
  image: z.string().nullish(),
});

export type Runner = z.infer<typeof runnerSchema>;
