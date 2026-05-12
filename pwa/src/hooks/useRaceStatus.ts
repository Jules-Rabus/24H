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

  const currentRunParticipations = currentRun
    ? (participations?.filter((p) => p.run?.id === currentRun.id) ?? [])
    : [];
  const finishedCount = currentRunParticipations.length;
  const totalCount = currentRun?.participantsCount ?? 0;
  const progressPct =
    totalCount > 0 ? Math.round((finishedCount / totalCount) * 100) : 0;

  const allFinishedCount = participations?.length ?? 0;
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

  /**
   * Pace chart : two series superposed on the same R1..Rn axis. The current
   * edition is keyed by `run.id` ; the previous one is keyed by chronological
   * index (sort by `run.startDate`, not by id, since ids don't necessarily
   * reflect chronological order).
   */
  const chartData: PaceChartPoint[] = useMemo(() => {
    const buildAveragesByRunId = (list: Participation[] | undefined) => {
      if (!list) return new Map<number, number>();
      const buckets = new Map<number, number[]>();
      for (const p of list) {
        const rid = p.run?.id;
        if (!rid || p.totalTime == null) continue;
        if (!buckets.has(rid)) buckets.set(rid, []);
        buckets.get(rid)!.push(p.totalTime);
      }
      const avg = new Map<number, number>();
      for (const [rid, times] of buckets) {
        const meanSec = times.reduce((s, t) => s + t, 0) / times.length;
        avg.set(rid, Math.round(meanSec / 4));
      }
      return avg;
    };

    const curAvg = buildAveragesByRunId(participations);

    // Previous edition : map(runId → run index) via chronological startDate.
    const prevByIndex = new Map<number, number>();
    if (prevParticipations) {
      const firstStartByRunId = new Map<number, number>();
      for (const p of prevParticipations) {
        const rid = p.run?.id;
        const start = p.run?.startDate
          ? new Date(p.run.startDate).getTime()
          : null;
        if (!rid || start == null) continue;
        const prev = firstStartByRunId.get(rid);
        if (prev === undefined || start < prev) {
          firstStartByRunId.set(rid, start);
        }
      }
      const sortedIds = [...firstStartByRunId.entries()]
        .sort((a, b) => a[1] - b[1])
        .map(([id]) => id);
      const idxOf = new Map<number, number>();
      sortedIds.forEach((id, i) => idxOf.set(id, i + 1));
      const buckets = new Map<number, number[]>();
      for (const p of prevParticipations) {
        if (!p.run?.id || p.totalTime == null) continue;
        const idx = idxOf.get(p.run.id);
        if (!idx) continue;
        if (!buckets.has(idx)) buckets.set(idx, []);
        buckets.get(idx)!.push(p.totalTime);
      }
      for (const [idx, times] of buckets) {
        const meanSec = times.reduce((s, t) => s + t, 0) / times.length;
        prevByIndex.set(idx, Math.round(meanSec / 4));
      }
    }

    return (runs ?? []).map((r, i) => ({
      name: `R${i + 1}`,
      secPerKm2026: curAvg.get(r.id) ?? null,
      secPerKm2025: prevByIndex.get(i + 1) ?? null,
      isCurrent: r.id === currentRun?.id,
    }));
  }, [runs, participations, prevParticipations, currentRun?.id]);

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
