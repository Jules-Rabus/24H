import { useMemo } from "react";
import {
  usePublicRunsQuery,
  usePublicParticipationsQuery,
} from "@/state/public/raceStatusQueries";
import { usePublicRunnersQuery } from "@/state/public/queries";
import { useRaceStatusLive } from "@/state/public/useRaceStatusLive";
import type { Participation } from "@/state/race/queries";
import type { PaceChartPoint } from "@/components/public/race-status/PaceLineChart";

/**
 * Aggregates everything the race-status pages need (mobile `/course` and
 * the desktop display `/public-race-status`) from the public endpoints.
 *
 * Exposes :
 *  - current/next run derived from the wall clock
 *  - per-edition counters (finishers, km, active racers)
 *  - countdown to the next run
 *  - chart data with the current edition superposed over the previous one
 *  - map(userId → km) for the previous edition (used to badge returning runners)
 *  - precomputed map(userId → km) for the current edition (avoids O(n²) work
 *    in `RecentArrivals`)
 */
export function useRaceStatus(edition: number) {
  const prevEdition = edition - 1;

  const { data: runs, isLoading: isRunsLoading } = usePublicRunsQuery(edition);
  const { data: prevRuns } = usePublicRunsQuery(prevEdition);
  const { data: participations, isLoading: isParticipationsLoading } =
    usePublicParticipationsQuery(edition);
  const { data: prevParticipations } =
    usePublicParticipationsQuery(prevEdition);
  const { data: prevRunners } = usePublicRunnersQuery(prevEdition);

  const { currentTime } = useRaceStatusLive();
  const now = currentTime?.getTime() ?? 0;

  const currentRun = runs?.find(
    (r) =>
      r.startDate &&
      r.endDate &&
      new Date(r.startDate).getTime() <= now &&
      now < new Date(r.endDate).getTime(),
  );
  const nextRun = runs?.find(
    (r) => r.startDate && new Date(r.startDate).getTime() > now,
  );
  const runIndex = currentRun
    ? (runs?.findIndex((r) => r.id === currentRun.id) ?? -1) + 1
    : 0;
  const totalRuns = runs?.length ?? 0;

  const nextDiffMs = nextRun?.startDate
    ? Math.max(new Date(nextRun.startDate).getTime() - now, 0)
    : 0;
  const nextH = Math.floor(nextDiffMs / 3600000);
  const nextM = Math.floor((nextDiffMs % 3600000) / 60000);
  const nextS = Math.floor((nextDiffMs % 60000) / 1000);

  // Counters served by the API on each run — no need to re-aggregate
  // participations client-side.
  const finishedCount = currentRun?.finishedParticipantsCount ?? 0;
  const totalCount = currentRun?.participantsCount ?? 0;
  const progressPct =
    totalCount > 0 ? Math.round((finishedCount / totalCount) * 100) : 0;

  // Total finishers across all runs of this edition — sum the per-run counter
  // already provided by the API instead of scanning the full participation list.
  const allFinishedCount = (runs ?? []).reduce(
    (s, r) => s + (r.finishedParticipantsCount ?? 0),
    0,
  );
  const totalAllKm = allFinishedCount * 4;
  const activeRacers = new Set(
    participations?.map((p) => p.user?.id).filter(Boolean),
  ).size;

  /**
   * Previous-edition km map (userId → km). Both pages need this : a fallback
   * on `prevParticipations` keeps the map populated even when the
   * `users/public` endpoint returns nothing.
   */
  const prevEditionKm = useMemo(() => {
    const m = new Map<number, number>();
    if (prevRunners) {
      for (const r of prevRunners) {
        if (r.id != null) {
          m.set(r.id, (r.finishedParticipationsCount ?? 0) * 4);
        }
      }
    }
    if (prevParticipations && m.size === 0) {
      for (const p of prevParticipations) {
        if (p.user?.id != null) {
          m.set(p.user.id, (m.get(p.user.id) ?? 0) + 4);
        }
      }
    }
    return m;
  }, [prevRunners, prevParticipations]);

  /**
   * Current-edition km map (userId → km). Precomputed once so `RecentArrivals`
   * can lookup each runner's total in O(1) rather than scanning the whole
   * participation list per card (O(n×m)).
   */
  const currentEditionKm = useMemo(() => {
    const m = new Map<number, number>();
    for (const p of participations ?? []) {
      if (p.user?.id != null) {
        m.set(p.user.id, (m.get(p.user.id) ?? 0) + 4);
      }
    }
    return m;
  }, [participations]);

  // Previous-edition runs, sorted chronologically, indexed alongside the
  // current edition. R5 (current) is compared against the 5th run (chrono) of
  // the previous edition — not the one with the same DB id.
  const prevRunsSorted = useMemo(() => {
    if (!prevRuns) return [];
    return [...prevRuns].sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    );
  }, [prevRuns]);

  /**
   * Pace chart : two series superposed on the same R1..Rn axis. `averageTime`
   * is precomputed by the API per run (total seconds), we just convert to
   * sec/km using the 4 km lap length.
   */
  const chartData: PaceChartPoint[] = useMemo(() => {
    const toSecPerKm = (totalSec: number | null | undefined): number | null =>
      totalSec != null && totalSec > 0 ? Math.round(totalSec / 4) : null;

    return (runs ?? []).map((r, i) => ({
      name: `R${i + 1}`,
      secPerKm2026: toSecPerKm(r.averageTime),
      secPerKm2025: toSecPerKm(prevRunsSorted[i]?.averageTime),
      isCurrent: r.id === currentRun?.id,
    }));
  }, [runs, prevRunsSorted, currentRun?.id]);

  return {
    // queries state
    isLoading: isRunsLoading || isParticipationsLoading,
    isRunsLoading,
    isParticipationsLoading,

    // data
    runs,
    participations,
    currentTime,
    now,

    // derived
    currentRun,
    nextRun,
    runIndex,
    totalRuns,
    nextH,
    nextM,
    nextS,
    finishedCount,
    totalCount,
    progressPct,
    totalAllKm,
    activeRacers,
    prevEditionKm,
    currentEditionKm,
    chartData,
    prevEdition,
  };
}
