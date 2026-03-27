import { useQuery } from "@tanstack/react-query"
import { apiUsersGetCollection, apiUsersIdGet } from "@/api/generated/sdk.gen"
import { z } from "zod"

const adminUserSchema = z.object({
  id: z.number().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  surname: z.string().nullish(),
  email: z.string().nullish(),
  roles: z.array(z.string()).optional(),
  organization: z.string().nullish(),
  participations: z.array(z.string()).optional(),
  finishedParticipationsCount: z.number().optional(),
  image: z.string().nullish(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export type AdminUser = z.infer<typeof adminUserSchema>

const usersCollectionSchema = z.object({
  member: z.array(adminUserSchema),
  totalItems: z.number().optional(),
})

export const adminUserKeys = {
  all: ["admin", "users"] as const,
  list: (filters?: Record<string, string>) =>
    [...adminUserKeys.all, "list", filters] as const,
  detail: (id: number) => [...adminUserKeys.all, "detail", id] as const,
}

export interface UserFilters {
  firstName?: string
  lastName?: string
  surname?: string
  email?: string
  page?: number
  itemsPerPage?: number
}

export function useAdminUsersQuery(filters: UserFilters = {}) {
  const { page = 1, itemsPerPage = 30, ...rest } = filters
  return useQuery({
    queryKey: adminUserKeys.list({
      page: String(page),
      itemsPerPage: String(itemsPerPage),
      ...(rest as Record<string, string>),
    }),
    queryFn: async () => {
      const { data } = await apiUsersGetCollection({
        query: { page, itemsPerPage, "order[lastName]": "asc", ...rest },
      })
      const parsed = usersCollectionSchema.parse(data)
      return { member: parsed.member, totalItems: parsed.totalItems ?? 0 }
    },
  })
}

export function useAdminUserQuery(id: number) {
  return useQuery({
    queryKey: adminUserKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiUsersIdGet({ path: { id: String(id) } })
      return adminUserSchema.parse(data)
    },
    enabled: !!id,
  })
}
