import { z } from "zod";
import { meSchema } from "@/state/auth/schemas";

type Me = z.infer<typeof meSchema>;

export function buildMe(overrides: Partial<Me> = {}): Me {
  return {
    id: 1,
    email: "admin@example.com",
    firstName: "Admin",
    lastName: "User",
    roles: ["ROLE_ADMIN"],
    image: null,
    ...overrides,
  };
}
