import { useQuery } from "@tanstack/react-query";
import { apiRaceMediasGetCollection } from "@/api/generated/sdk.gen";
import { z } from "zod";
import { raceMediaSchema, type RaceMedia } from "@/state/media/schemas";

export type AdminRaceMedia = RaceMedia;

export const adminMediaKeys = {
  all: ["admin", "medias"] as const,
  list: () => [...adminMediaKeys.all, "list"] as const,
};

export function useAdminRaceMediasQuery() {
  return useQuery({
    queryKey: adminMediaKeys.list(),
    queryFn: async () => {
      const { data } = await apiRaceMediasGetCollection({
        query: { "order[createdAt]": "desc", itemsPerPage: 100 },
      });
      return z.array(raceMediaSchema).parse(data);
    },
  });
}
