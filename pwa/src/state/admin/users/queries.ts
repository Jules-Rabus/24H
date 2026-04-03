import { useQuery } from "@tanstack/react-query";
import { apiUsersGetCollection, apiUsersIdGet } from "@/api/generated/sdk.gen";
import { z } from "zod";
import { userApiSchema, type AdminUser } from "./schemas";

export type { AdminUser };

export const adminUserKeys = {
  all: ["admin", "users"] as const,
  list: (filters?: Record<string, string>) =>
    [...adminUserKeys.all, "list", filters] as const,
  detail: (id: number) => [...adminUserKeys.all, "detail", id] as const,
};

export interface UserFilters {
  id?: number;
  firstName?: string;
  lastName?: string;
  surname?: string;
  email?: string;
  page?: number;
  itemsPerPage?: number;
  orderField?: string;
  orderDir?: "asc" | "desc";
}

export function useAdminUsersQuery(filters: UserFilters = {}) {
  const {
    page = 1,
    itemsPerPage = 30,
    orderField = "lastName",
    orderDir = "asc",
    ...rest
  } = filters;
  const orderKey = `order[${orderField}]` as `order[${string}]`;
  return useQuery({
    queryKey: adminUserKeys.list({
      page: String(page),
      itemsPerPage: String(itemsPerPage),
      orderField,
      orderDir,
      ...(rest as Record<string, string>),
    }),
    queryFn: async () => {
      const { data } = await apiUsersGetCollection({
        query: { page, itemsPerPage, [orderKey]: orderDir, ...rest },
      });
      const member = z.array(userApiSchema).parse(data);
      return { member, totalItems: member.length };
    },
  });
}

export function useAdminUserQuery(id: number) {
  return useQuery({
    queryKey: adminUserKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiUsersIdGet({ path: { id: String(id) } });
      return userApiSchema.parse(data);
    },
    enabled: !!id,
  });
}
