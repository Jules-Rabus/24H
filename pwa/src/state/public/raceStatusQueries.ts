import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { apiClient } from "@/api/client";
import {
  participationSchema,
  runSchema,
  type Participation,
  type Run,
} from "@/state/race/schemas";
import { raceMediaSchema, type RaceMedia } from "@/state/media/schemas";

export type { Run, Participation, RaceMedia };

const publicRunSchema = runSchema.extend({
  edition: z.number().nullish(),
});
export type PublicRun = z.infer<typeof publicRunSchema>;

export const publicRaceKeys = {
  all: ["public", "race"] as const,
  runs: (edition?: number) =>
    [...publicRaceKeys.all, "runs", edition ?? null] as const,
  participations: (edition?: number) =>
    [...publicRaceKeys.all, "participations", edition ?? null] as const,
  medias: () => [...publicRaceKeys.all, "medias"] as const,
};

function unwrap<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (
    payload &&
    typeof payload === "object" &&
    Array.isArray((payload as { member?: T[] }).member)
  ) {
    return (payload as { member: T[] }).member;
  }
  return [];
}

export function usePublicRunsQuery(edition?: number) {
  return useQuery({
    queryKey: publicRaceKeys.runs(edition),
    queryFn: async () => {
      const { data } = await apiClient.get("/runs/public", {
        params: {
          "order[startDate]": "asc",
          ...(edition ? { edition: String(edition) } : undefined),
        },
        withCredentials: false,
      });
      return z.array(publicRunSchema).parse(unwrap(data));
    },
    staleTime: 30 * 1000,
  });
}

export function usePublicParticipationsQuery(
  edition?: number,
  status: "FINISHED" | "ALL" = "FINISHED",
) {
  return useQuery({
    queryKey: [...publicRaceKeys.participations(edition), status],
    queryFn: async () => {
      const { data } = await apiClient.get("/participations/public", {
        params: {
          "order[arrivalTime]": "desc",
          itemsPerPage: 1000,
          ...(edition ? { edition: String(edition) } : undefined),
        },
        withCredentials: false,
      });
      const all = z.array(participationSchema).parse(unwrap(data));
      // `status` is a computed property on the API DTO (derived from
      // arrivalTime), so there's no Doctrine column to filter on server-side.
      // Filter client-side instead.
      return status === "FINISHED"
        ? all.filter((p) => p.status === "FINISHED")
        : all;
    },
    staleTime: 15 * 1000,
  });
}

/**
 * Public race medias — same endpoint as the admin variant but explicitly
 * anonymous (no JWT cookie) so the public race-status pages can poll it
 * without leaking admin credentials.
 */
export function usePublicRaceMediasQuery() {
  return useQuery({
    queryKey: publicRaceKeys.medias(),
    queryFn: async () => {
      const { data } = await apiClient.get("/race_medias", {
        params: { "order[createdAt]": "desc", itemsPerPage: 100 },
        withCredentials: false,
      });
      return z.array(raceMediaSchema).parse(unwrap(data));
    },
    staleTime: 15 * 1000,
  });
}
