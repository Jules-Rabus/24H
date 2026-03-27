import { useQuery } from "@tanstack/react-query"
import { apiRaceMediasGetCollection } from "@/api/generated/sdk.gen"
import { z } from "zod"

const raceMediaSchema = z.object({
  id: z.number().nullish(),
  filePath: z.string().nullish(),
  createdAt: z.string().nullish(),
})

export type AdminRaceMedia = z.infer<typeof raceMediaSchema>

const raceMediasCollectionSchema = z.object({
  member: z.array(raceMediaSchema),
  totalItems: z.number().optional(),
})

export const adminMediaKeys = {
  all: ["admin", "medias"] as const,
  list: () => [...adminMediaKeys.all, "list"] as const,
}

export function useAdminRaceMediasQuery() {
  return useQuery({
    queryKey: adminMediaKeys.list(),
    queryFn: async () => {
      const { data } = await apiRaceMediasGetCollection({
        query: { "order[createdAt]": "desc", itemsPerPage: 100 },
      })
      return raceMediasCollectionSchema.parse(data).member
    },
  })
}
