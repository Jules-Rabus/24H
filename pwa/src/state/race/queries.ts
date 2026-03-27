import { useQuery } from "@tanstack/react-query"
import { apiRunsGetCollection, apiParticipationsGetCollection } from "@/api/generated/sdk.gen"
import {
  runsCollectionSchema,
  participationsCollectionSchema,
  type Run,
  type Participation,
} from "./schemas"

export type { Run, Participation }

export const raceKeys = {
  all: ["race"] as const,
  runs: () => [...raceKeys.all, "runs"] as const,
  participations: () => [...raceKeys.all, "participations"] as const,
}

export function useRunsQuery() {
  return useQuery({
    queryKey: raceKeys.runs(),
    queryFn: async () => {
      const { data } = await apiRunsGetCollection({
        query: { "order[startDate]": "asc" },
      })
      const parsed = runsCollectionSchema.parse(data)
      return parsed.member
    },
  })
}

export function useParticipationsQuery() {
  return useQuery({
    queryKey: raceKeys.participations(),
    queryFn: async () => {
      const { data } = await apiParticipationsGetCollection({
        query: { "order[arrivalTime]": "desc", itemsPerPage: 1000 },
      })
      const parsed = participationsCollectionSchema.parse(data)
      return parsed.member.filter((p) => p.status === "FINISHED")
    },
  })
}
