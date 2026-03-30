import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { meSchema, type Me } from "./schemas";

export type { Me };

export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

export function useMe() {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: async () => {
      const { data } = await apiClient.get<unknown>("/me");
      return meSchema.parse(data);
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
}
