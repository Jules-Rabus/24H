import { useQuery } from "@tanstack/react-query";
import { apiRunsGetCollection, apiRunsIdGet } from "@/api/generated/sdk.gen";
import { z } from "zod";
import { runCollectionSchema, type AdminRun } from "./schemas";

export type { AdminRun };

export const adminRunKeys = {
  all: ["admin", "runs"] as const,
  list: (orderField?: string, orderDir?: string) =>
    [...adminRunKeys.all, "list", orderField, orderDir] as const,
  detail: (id: number) => [...adminRunKeys.all, "detail", id] as const,
};

export function useAdminRunsQuery(
  orderField = "startDate",
  orderDir: "asc" | "desc" = "asc",
) {
  const orderKey = `order[${orderField}]` as `order[${string}]`;
  return useQuery({
    queryKey: adminRunKeys.list(orderField, orderDir),
    queryFn: async () => {
      const { data } = await apiRunsGetCollection({
        query: { [orderKey]: orderDir, itemsPerPage: 100 },
      });
      return z.array(runCollectionSchema).parse(data);
    },
  });
}

export function useAdminRunQuery(id: number) {
  return useQuery({
    queryKey: adminRunKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiRunsIdGet({ path: { id: String(id) } });
      return runCollectionSchema.parse(data);
    },
    enabled: !!id,
  });
}
