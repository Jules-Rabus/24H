import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { apiClient } from "@/api/client";
import { userCollectionSchema, type PublicRunner } from "./schemas";

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

export const publicKeys = {
  all: ["public"] as const,
  runners: (params?: Record<string, unknown>) =>
    [...publicKeys.all, "runners", params] as const,
  runner: (id: number) => [...publicKeys.all, "runner", id] as const,
};

// `withCredentials: false` keeps the admin JWT cookie out of public reads.
// `staleTime: 2 min` matches the other public queries — Mercure invalidates
// instantly on a finished arrival, this only affects mount/focus refetches.
export function usePublicRunnersQuery(edition?: number) {
  return useQuery({
    queryKey: publicKeys.runners(edition ? { edition } : undefined),
    queryFn: async () => {
      const { data } = await apiClient.get("/public/users", {
        params: {
          itemsPerPage: 500,
          ...(edition ? { edition: String(edition) } : undefined),
        },
        withCredentials: false,
      });
      return z.array(userCollectionSchema).parse(unwrap(data));
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function usePublicRunnerQuery(id: number) {
  return useQuery({
    queryKey: publicKeys.runner(id),
    queryFn: async () => {
      const { data } = await apiClient.get(`/public/users/${id}`, {
        withCredentials: false,
      });
      return userCollectionSchema.parse(data);
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

export type { PublicRunner };
