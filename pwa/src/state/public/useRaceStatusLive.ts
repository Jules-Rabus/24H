"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { raceKeys } from "@/state/race/queries";
import { participationSchema } from "@/state/race/schemas";
import { adminMediaKeys } from "@/state/admin/medias/queries";

/**
 * Maintains the current wall-clock time (refreshed every second) and subscribes
 * to Mercure topics so that participations and race medias stay in sync on the
 * public race-status screen.
 */
export function useRaceStatusLive() {
  const queryClient = useQueryClient();
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    const update = () => setCurrentTime(new Date());
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const hubUrl = process.env.NEXT_PUBLIC_MERCURE_HUB_URL;
    if (!hubUrl) return;
    const entrypoint =
      process.env.NEXT_PUBLIC_ENTRYPOINT || window.location.origin;
    const url = new URL(hubUrl);
    url.searchParams.append("topic", `${entrypoint}/participations/{id}`);
    url.searchParams.append("topic", `${entrypoint}/race_medias/{id}`);
    const es = new EventSource(url.toString(), { withCredentials: true });
    es.onmessage = (e) => {
      try {
        const raw = JSON.parse(e.data);

        // New participation finished — parse through Zod for safety
        if (raw.status === "FINISHED") {
          const parsed = participationSchema.safeParse(raw);
          const data = parsed.success ? parsed.data : raw;
          queryClient.setQueryData(
            raceKeys.participations(),
            (old: unknown) => {
              if (!Array.isArray(old)) return old;
              if (old.find((p: { id: number }) => p.id === data.id)) return old;
              return [data, ...old].sort(
                (a: { arrivalTime?: string }, b: { arrivalTime?: string }) => {
                  const tA = a.arrivalTime
                    ? new Date(a.arrivalTime).getTime()
                    : 0;
                  const tB = b.arrivalTime
                    ? new Date(b.arrivalTime).getTime()
                    : 0;
                  return tB - tA;
                },
              );
            },
          );
          queryClient.invalidateQueries({ queryKey: raceKeys.runs() });
        }

        // New race media — invalidate to refetch the gallery
        if (raw.contentUrl !== undefined) {
          queryClient.invalidateQueries({
            queryKey: adminMediaKeys.list(),
          });
        }
      } catch {}
    };
    return () => es.close();
  }, [queryClient]);

  return { currentTime };
}
