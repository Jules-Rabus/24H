"use client";

import { SimpleGrid } from "@chakra-ui/react";
import { LuTrophy, LuMapPin, LuTimer, LuGauge } from "react-icons/lu";
import { PublicStatCard } from "@/components/public/PublicStatCard";
import { formatTime, formatPace } from "@/utils/race";
import type { EditionStats } from "@/state/public/schemas";

function timeDelta(
  current: number | null,
  prev: number | null,
): { label: string; positive: boolean } | null {
  if (current == null || prev == null) return null;
  const diff = current - prev;
  if (diff === 0) return null;
  const abs = Math.abs(diff);
  const m = Math.floor(abs / 60);
  const s = abs % 60;
  const sign = diff < 0 ? "-" : "+";
  return {
    label: `${sign}${m}:${s.toString().padStart(2, "0")}`,
    positive: diff < 0,
  };
}

function paceDelta(
  current: number | null,
  prev: number | null,
): { label: string; positive: boolean } | null {
  if (current == null || prev == null) return null;
  const diffSec = current / 4 - prev / 4;
  if (diffSec === 0) return null;
  const abs = Math.abs(diffSec);
  const m = Math.floor(abs / 60);
  const s = Math.round(abs % 60);
  const sign = diffSec < 0 ? "-" : "+";
  return {
    label: `${sign}${m}:${s.toString().padStart(2, "0")}/km`,
    positive: diffSec < 0,
  };
}

export function RunnerStatCards({
  stats,
  prevStats,
  loading,
}: {
  stats: EditionStats;
  prevStats?: EditionStats;
  loading?: boolean;
}) {
  const toursDiff =
    prevStats != null ? stats.finishedCount - prevStats.finishedCount : null;
  const distDiff =
    prevStats != null ? stats.distance - prevStats.distance : null;
  const bestTimeDelta = timeDelta(
    stats.bestTime ?? null,
    prevStats?.bestTime ?? null,
  );
  const paceDeltaVal = paceDelta(
    stats.averageTime ?? null,
    prevStats?.averageTime ?? null,
  );

  return (
    <SimpleGrid columns={2} gap="3">
      <PublicStatCard
        label="Tours terminés"
        value={stats.finishedCount}
        icon={LuTrophy}
        color="primary.500"
        loading={loading}
        delta={
          toursDiff != null && toursDiff !== 0
            ? `${toursDiff >= 0 ? "+" : ""}${toursDiff}`
            : undefined
        }
        deltaPositive={toursDiff != null ? toursDiff >= 0 : undefined}
      />
      <PublicStatCard
        label="Distance"
        value={`${stats.distance} km`}
        icon={LuMapPin}
        color="green.500"
        loading={loading}
        delta={
          distDiff != null && distDiff !== 0
            ? `${distDiff >= 0 ? "+" : ""}${distDiff} km`
            : undefined
        }
        deltaPositive={distDiff != null ? distDiff >= 0 : undefined}
      />
      <PublicStatCard
        label="Meilleur temps"
        value={formatTime(stats.bestTime)}
        icon={LuTimer}
        color="blue.500"
        loading={loading}
        delta={bestTimeDelta?.label}
        deltaPositive={bestTimeDelta?.positive}
      />
      <PublicStatCard
        label="Allure moy."
        value={formatPace(stats.averageTime)}
        icon={LuGauge}
        color="orange.500"
        loading={loading}
        delta={paceDeltaVal?.label}
        deltaPositive={paceDeltaVal?.positive}
      />
    </SimpleGrid>
  );
}
