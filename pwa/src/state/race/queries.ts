import { useQuery } from "@tanstack/react-query"
import { apiRunsGetCollection, apiParticipationsGetCollection } from "@/api/generated/sdk.gen"
import {
  runSchema,
  participationSchema,
  type Run,
  type Participation,
} from "./schemas"
import { z } from "zod"

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
      return z.array(runSchema).parse(data)
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
      return z.array(participationSchema).parse(data).filter((p) => p.status === "FINISHED")
    },
  })
}
