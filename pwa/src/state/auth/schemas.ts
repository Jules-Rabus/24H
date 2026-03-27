import { z } from "zod"

export const meSchema = z.object({
  id: z.number().optional(),
  email: z.string().email().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  roles: z.array(z.string()).optional(),
})

export type Me = z.infer<typeof meSchema>
