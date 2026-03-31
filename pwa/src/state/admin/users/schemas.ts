import { z } from "zod";

export const userFormSchema = z.object({
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  surname: z.string().optional().default(""),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  plainPassword: z.string().optional().default(""),
  organization: z.string().optional().default(""),
  isAdmin: z.boolean().default(false),
});

export type UserFormValues = z.infer<typeof userFormSchema>;
