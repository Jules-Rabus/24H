import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/api/client"

export const raceKeys = {
  all: ["race"] as const,
  runs: () => [...raceKeys.all, "runs"] as const,
  participations: () => [...raceKeys.all, "participations"] as const,
}

export interface Run {
  id: number
  startDate: string
  endDate: string
  participations: string[]
  finishedParticipantsCount: number
  inProgressParticipantsCount: number
  participantsCount: number
}

export interface Participation {
  id: number
  arrivalTime?: string
  totalTime?: number
  user: {
    id: number
    firstName: string
    lastName: string
    surname?: string
    finishedParticipationsCount: number
  }
  run: string
  status: string
}

async function fetchRuns(): Promise<Run[]> {
  const { data } = await apiClient.get<{ member: Run[] }>("/runs", {
    params: { "order[startDate]": "asc" },
    headers: { Accept: "application/ld+json" },
  })
  return data.member
}

async function fetchParticipations(): Promise<Participation[]> {
  const { data } = await apiClient.get<{ member: Participation[] }>("/participations", {
    params: { "order[arrivalTime]": "desc", itemsPerPage: 1000 },
    headers: { Accept: "application/ld+json" },
  })
  return data.member.filter((p) => p.status === "FINISHED")
}

export function useRunsQuery() {
  return useQuery({
    queryKey: raceKeys.runs(),
    queryFn: fetchRuns,
  })
}

export function useParticipationsQuery() {
  return useQuery({
    queryKey: raceKeys.participations(),
    queryFn: fetchParticipations,
  })
}
