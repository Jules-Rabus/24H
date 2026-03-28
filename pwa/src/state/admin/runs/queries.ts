import { useQuery } from "@tanstack/react-query";
import { apiRunsGetCollection, apiRunsIdGet } from "@/api/generated/sdk.gen";
import { z } from "zod";

const runSchema = z.object({
  id: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  participantsCount: z.number().optional(),
  inProgressParticipantsCount: z.number().optional(),
  finishedParticipantsCount: z.number().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type AdminRun = z.infer<typeof runSchema>;

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
      return z.array(runSchema).parse(data);
    },
  });
}

export function useAdminRunQuery(id: number) {
  return useQuery({
    queryKey: adminRunKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiRunsIdGet({ path: { id: String(id) } });
      return runSchema.parse(data);
    },
    enabled: !!id,
  });
}
