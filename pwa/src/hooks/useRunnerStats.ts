import { useMemo } from "react";
import type { PublicRunner, EditionStats } from "@/state/public/schemas";
import type { PublicParticipation } from "@/state/public/schemas";

function computeEditionStats(
  participations: PublicParticipation[],
): EditionStats {
  const finished = participations.filter(
    (p) => p.status === "FINISHED" && p.totalTime != null,
  );
  const times = finished
    .map((p) => p.totalTime!)
    .filter((t): t is number => t != null);
  return {
    finishedCount: finished.length,
    distance: finished.length * 4,
    bestTime: times.length > 0 ? Math.min(...times) : null,
    averageTime:
      times.length > 0
        ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
        : null,
  };
}

// TODO: parameterize years once multiple editions are in production (currently hardcoded 2026/2025)
export function useRunnerStats(runner: PublicRunner | undefined) {
  const participations = useMemo(
    () => runner?.participations ?? [],
    [runner?.participations],
  );

  const participations2026 = useMemo(
    () => participations.filter((p) => p.runEdition === 2026),
    [participations],
  );

  const participations2025 = useMemo(
    () => participations.filter((p) => p.runEdition === 2025),
    [participations],
  );

  const stats2026 = useMemo(
    () => computeEditionStats(participations2026),
    [participations2026],
  );

  const stats2025 = useMemo(
    () => computeEditionStats(participations2025),
    [participations2025],
  );

  const chartData = useMemo(() => {
    const maxLen = Math.max(
      participations2026.length,
      participations2025.length,
    );
    if (maxLen === 0) return [];
    // pace = seconds per km, kept as float for chart precision (4 km lap).
    const paceSecPerKm = (totalTimeSec: number | null | undefined) =>
      totalTimeSec != null ? totalTimeSec / 4 : null;
    return Array.from({ length: maxLen }, (_, i) => {
      const p26 = participations2026[i];
      const p25 = participations2025[i];
      return {
        name: `T${i + 1}`,
        pace2026: paceSecPerKm(p26?.totalTime),
        pace2025: paceSecPerKm(p25?.totalTime),
      };
    });
  }, [participations2026, participations2025]);

  return {
    stats2026,
    stats2025,
    participations2026,
    participations2025,
    chartData,
  };
}
