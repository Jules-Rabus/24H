import { useQuery } from "@tanstack/react-query";
import { apiParticipationsGetCollection } from "@/api/generated/sdk.gen";
import { z } from "zod";
import {
  participationCollectionSchema,
  type AdminParticipation,
} from "./schemas";

export type { AdminParticipation };

export const adminParticipationKeys = {
  all: ["admin", "participations"] as const,
  list: (filters?: Record<string, string>) =>
    [...adminParticipationKeys.all, "list", filters] as const,
};

export interface ParticipationFilters {
  "user.firstName"?: string;
  "user.lastName"?: string;
  "user.id"?: string;
  "run.id"?: number;
  page?: number;
  itemsPerPage?: number;
  orderField?: string;
  orderDir?: "asc" | "desc";
}

export function useAdminParticipationsQuery(
  filters: ParticipationFilters = {},
) {
  const {
    page = 1,
    itemsPerPage = 30,
    orderField = "run.id",
    orderDir = "asc",
    "user.id": userIdStr,
    ...rest
  } = filters;
  const orderKey = `order[${orderField}]` as `order[${string}]`;
  const keyFilters: Record<string, string> = {
    page: String(page),
    itemsPerPage: String(itemsPerPage),
    orderField,
    orderDir,
  };
  if (userIdStr) keyFilters["user.id"] = userIdStr;
  for (const [k, v] of Object.entries(rest)) {
    if (v !== undefined) keyFilters[k] = String(v);
  }
  const userId = userIdStr ? Number(userIdStr) : undefined;
  return useQuery({
    queryKey: adminParticipationKeys.list(keyFilters),
    queryFn: async () => {
      const { data } = await apiParticipationsGetCollection({
        query: {
          page,
          itemsPerPage,
          [orderKey]: orderDir,
          ...rest,
          ...(userId ? { "user.id": userId } : {}),
        },
      });
      const member = z.array(participationCollectionSchema).parse(data);
      return { member, totalItems: member.length };
    },
  });
}

export function useAdminUserParticipationsQuery(userId: number) {
  return useQuery({
    queryKey: adminParticipationKeys.list({ "user.id": String(userId) }),
    queryFn: async () => {
      const { data } = await apiParticipationsGetCollection({
        query: { "user.id": userId, itemsPerPage: 200 },
      });
      const member = z.array(participationCollectionSchema).parse(data);
      return { member, totalItems: member.length };
    },
    enabled: !!userId,
  });
}

export function useAdminRunParticipationsQuery(runId: number) {
  return useQuery({
    queryKey: adminParticipationKeys.list({ "run.id": String(runId) }),
    queryFn: async () => {
      const { data } = await apiParticipationsGetCollection({
        query: { "run.id": runId, itemsPerPage: 200 },
      });
      const member = z.array(participationCollectionSchema).parse(data);
      return { member, totalItems: member.length };
    },
    enabled: !!runId,
  });
}
