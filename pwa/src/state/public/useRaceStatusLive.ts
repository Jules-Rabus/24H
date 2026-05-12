"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { raceKeys } from "@/state/race/queries";
import { participationSchema } from "@/state/race/schemas";
import { adminMediaKeys } from "@/state/admin/medias/queries";
import { publicRaceKeys } from "@/state/public/raceStatusQueries";

/**
 * Maintains the current wall-clock time (refreshed every second) and subscribes
 * to Mercure topics so that participations and race medias stay in sync on the
 * public race-status screens (both /public-race-status admin view and /accueil
 * public mobile view).
 */
export function useRaceStatusLive() {
  const queryClient = useQueryClient();
  // Initialise eagerly with a Date so `now = currentTime?.getTime() ?? 0` is
  // never zero on the first render — otherwise `currentRun` lookups fall
  // through and the UI flashes "En attente" before the first 1s tick.
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const hubUrl = process.env.NEXT_PUBLIC_MERCURE_HUB_URL;
    // In mock/dev mode without a backend, skip the SSE subscription entirely —
    // the hub URL would point at https://localhost/.well-known/mercure which
    // 404s and floods the console.
    if (!hubUrl || process.env.NEXT_PUBLIC_API_MOCK === "1") return;
    const entrypoint =
      process.env.NEXT_PUBLIC_ENTRYPOINT || window.location.origin;
    const url = new URL(hubUrl);
    url.searchParams.append("topic", `${entrypoint}/participations/{id}`);
    url.searchParams.append("topic", `${entrypoint}/race_medias/{id}`);
    // Public Mercure topics — open the SSE stream without credentials so the
    // browser doesn't ship the admin JWT cookie to the hub from public pages.
    const es = new EventSource(url.toString(), { withCredentials: false });
    es.onmessage = (e) => {
      try {
        const raw = JSON.parse(e.data);

        // New participation finished — patch admin cache, invalidate public
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
          // Public mobile view uses a different queryKey — refetch wholesale
          queryClient.invalidateQueries({ queryKey: publicRaceKeys.all });
        }

        // New race media — invalidate to refetch the gallery
        if (raw.contentUrl !== undefined) {
          queryClient.invalidateQueries({
            queryKey: adminMediaKeys.list(),
          });
        }
      } catch (err) {
        console.warn("[Mercure] invalid message", err);
      }
    };
    return () => es.close();
  }, [queryClient]);

  return { currentTime };
}
