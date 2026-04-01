import { useQuery } from "@tanstack/react-query";
import {
  apiUserspublicGetCollection,
  apiUserspublicIdGet,
} from "@/api/generated/sdk.gen";
import { z } from "zod";
import { publicRunnerSchema, type PublicRunner } from "./schemas";

export const publicKeys = {
  all: ["public"] as const,
  runners: (params?: Record<string, unknown>) =>
    [...publicKeys.all, "runners", params] as const,
  runner: (id: number) => [...publicKeys.all, "runner", id] as const,
};

export function usePublicRunnersQuery(edition?: number) {
  return useQuery({
    queryKey: publicKeys.runners(edition ? { edition } : undefined),
    queryFn: async () => {
      const { data } = await apiUserspublicGetCollection({
        query: {
          itemsPerPage: 500,
          ...(edition ? { edition: String(edition) } : undefined),
        },
      });
      return z.array(publicRunnerSchema).parse(data);
    },
  });
}

export function usePublicRunnerQuery(id: number) {
  return useQuery({
    queryKey: publicKeys.runner(id),
    queryFn: async () => {
      const { data } = await apiUserspublicIdGet({
        path: { id: String(id) },
      });
      return publicRunnerSchema.parse(data);
    },
    enabled: !!id,
  });
}

export type { PublicRunner };
