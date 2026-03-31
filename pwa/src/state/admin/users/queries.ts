import { useQuery } from "@tanstack/react-query";
import { apiUsersGetCollection, apiUsersIdGet } from "@/api/generated/sdk.gen";
import { z } from "zod";

const adminUserSchema = z.object({
  id: z.number().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  surname: z.string().nullish(),
  email: z.string().nullish(),
  roles: z.array(z.string()).optional(),
  organization: z.string().nullish(),
  participations: z.array(z.number()).optional(),
  finishedParticipationsCount: z.number().optional(),
  totalTime: z.number().nullish(),
  bestTime: z.number().nullish(),
  averageTime: z.number().nullish(),
  image: z.string().nullish(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type AdminUser = z.infer<typeof adminUserSchema>;

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
      const member = z.array(adminUserSchema).parse(data);
      return { member, totalItems: member.length };
    },
  });
}

export function useAdminUserQuery(id: number) {
  return useQuery({
    queryKey: adminUserKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiUsersIdGet({ path: { id: String(id) } });
      return adminUserSchema.parse(data);
    },
    enabled: !!id,
  });
}
