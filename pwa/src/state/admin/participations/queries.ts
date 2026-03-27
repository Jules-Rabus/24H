import { useQuery } from "@tanstack/react-query"
import { apiParticipationsGetCollection } from "@/api/generated/sdk.gen"
import { z } from "zod"

const participationSchema = z.object({
  id: z.number().optional(),
  run: z.string().nullish(),
  user: z.string().nullish(),
  arrivalTime: z.string().nullish(),
  totalTime: z.number().nullish(),
  status: z.string().optional(),
})

export type AdminParticipation = z.infer<typeof participationSchema>

const participationsCollectionSchema = z.object({
  member: z.array(participationSchema),
  totalItems: z.number().optional(),
})

export const adminParticipationKeys = {
  all: ["admin", "participations"] as const,
  list: (filters?: Record<string, string>) =>
    [...adminParticipationKeys.all, "list", filters] as const,
}

export interface ParticipationFilters {
  "user.firstName"?: string
  "user.lastName"?: string
  "user.surname"?: string
  "run.id"?: number
  page?: number
  itemsPerPage?: number
}

export function useAdminParticipationsQuery(filters: ParticipationFilters = {}) {
  const { page = 1, itemsPerPage = 30, ...rest } = filters
  // Build a serialisable key (stringify numeric run.id)
  const keyFilters: Record<string, string> = {
    page: String(page),
    itemsPerPage: String(itemsPerPage),
  }
  for (const [k, v] of Object.entries(rest)) {
    if (v !== undefined) keyFilters[k] = String(v)
  }
  return useQuery({
    queryKey: adminParticipationKeys.list(keyFilters),
    queryFn: async () => {
      const { data } = await apiParticipationsGetCollection({
        query: { page, itemsPerPage, "order[run.id]": "asc", ...rest },
      })
      const parsed = participationsCollectionSchema.parse(data)
      return { member: parsed.member, totalItems: parsed.totalItems ?? 0 }
    },
  })
}
