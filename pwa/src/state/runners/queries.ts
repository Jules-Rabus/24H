import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { apiClient } from "@/api/client"

const ITEMS_PER_PAGE = 30

export const runnerKeys = {
  all: ["runners"] as const,
  list: (params?: Record<string, string>) => [...runnerKeys.all, "list", params] as const,
  infinite: (params?: Record<string, string>) => [...runnerKeys.all, "infinite", params] as const,
}

export interface Runner {
  id: number
  firstName: string
  lastName: string
  surname?: string | null
  organization?: string | null
}

interface RunnersPage {
  member: Runner[]
  totalItems: number
  nextPage: number | null
}

async function fetchRunnersPage(page: number, params?: Record<string, string>): Promise<RunnersPage> {
  const { data } = await apiClient.get<{ member: Runner[]; "hydra:totalItems": number; "hydra:view"?: { "hydra:next"?: string } }>("/users/public", {
    params: { itemsPerPage: ITEMS_PER_PAGE, page, ...params },
    headers: { Accept: "application/ld+json" },
  })
  const hasNext = !!data["hydra:view"]?.["hydra:next"]
  return {
    member: data.member,
    totalItems: data["hydra:totalItems"],
    nextPage: hasNext ? page + 1 : null,
  }
}

export function useRunnersInfiniteQuery(params?: Record<string, string>) {
  return useInfiniteQuery({
    queryKey: runnerKeys.infinite(params),
    queryFn: ({ pageParam }) => fetchRunnersPage(pageParam as number, params),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  })
}

export function useRunnersQuery(params?: Record<string, string>) {
  return useQuery({
    queryKey: runnerKeys.list(params),
    queryFn: async () => {
      const page = await fetchRunnersPage(1, { ...params, itemsPerPage: "100" })
      return page.member
    },
  })
}
