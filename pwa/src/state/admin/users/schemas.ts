import { z } from "zod";

// ---------------------------------------------------------------------------
// Read — matches UserApi resource (admin GetCollection / Get)
// ---------------------------------------------------------------------------

export const userApiSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  surname: z.string().nullish(),
  email: z.string().nullish(),
  roles: z.array(z.string()),
  organization: z.string().nullish(),
  finishedParticipationsCount: z.number(),
  totalTime: z.number().nullish(),
  bestTime: z.number().nullish(),
  averageTime: z.number().nullish(),
  image: z.string().nullish(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type AdminUser = z.infer<typeof userApiSchema>;

// ---------------------------------------------------------------------------
// Write — form validation schema (matches CreateUser / UpdateUser DTO)
// ---------------------------------------------------------------------------

export const createUserSchema = z.object({
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  surname: z.string(),
  email: z.string().email("Email invalide").or(z.literal("")),
  plainPassword: z.string(),
  organization: z.string(),
  isAdmin: z.boolean(),
});

export type CreateUserValues = z.infer<typeof createUserSchema>;

export const editUserSchema = z.object({
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  surname: z.string(),
  email: z.string().email("Email invalide").or(z.literal("")),
  organization: z.string(),
  isAdmin: z.boolean(),
});

export type EditUserValues = z.infer<typeof editUserSchema>;
