import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { apiRaceMediasGetCollection } from "@/api/generated/sdk.gen";
import { raceMediaSchema } from "@/state/media/schemas";

export const publicMediaKeys = {
  all: ["public", "medias"] as const,
  list: () => [...publicMediaKeys.all, "list"] as const,
};

export function usePublicRaceMediasQuery() {
  return useQuery({
    queryKey: publicMediaKeys.list(),
    queryFn: async () => {
      // Note: API OrderFilter only supports id/createdAt — likesCount ordering is done client-side in gallery/page.tsx
      const { data } = await apiRaceMediasGetCollection({
        query: { "order[createdAt]": "desc", itemsPerPage: 100 },
      });
      return z.array(raceMediaSchema).parse(data);
    },
  });
}
