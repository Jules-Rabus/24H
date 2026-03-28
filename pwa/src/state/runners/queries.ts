import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { apiUserspublicGetCollection } from "@/api/generated/sdk.gen"
import { runnerSchema, type Runner } from "./schemas"
import { z } from "zod"

export type { Runner }

const ITEMS_PER_PAGE = 30

export const runnerKeys = {
  all: ["runners"] as const,
  list: (params?: Record<string, string>) => [...runnerKeys.all, "list", params] as const,
  infinite: (params?: Record<string, string>) => [...runnerKeys.all, "infinite", params] as const,
}

interface RunnersPage {
  member: Runner[]
  totalItems: number
  nextPage: number | null
}

async function fetchRunnersPage(
  page: number,
  extraParams?: Record<string, string>,
): Promise<RunnersPage> {
  const { data } = await apiUserspublicGetCollection({
    query: { page, itemsPerPage: ITEMS_PER_PAGE, ...extraParams },
  })
  const member = z.array(runnerSchema).parse(data)
  // API returns plain array; if we got a full page there may be more
  const hasNext = member.length === ITEMS_PER_PAGE
  return {
    member,
    totalItems: member.length,
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
      const { data } = await apiUserspublicGetCollection({
        query: { itemsPerPage: 100, ...params },
      })
      return z.array(runnerSchema).parse(data)
    },
  })
}
