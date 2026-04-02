"use client";

import { SimpleGrid } from "@chakra-ui/react";
import { LuTrophy, LuMapPin, LuTimer, LuGauge } from "react-icons/lu";
import { StatCard } from "@/components/admin/ui/StatCard";
import { formatTime, formatPace } from "@/utils/race";
import type { EditionStats } from "@/state/public/schemas";

export function RunnerStatCards({
  stats,
  loading,
}: {
  stats: EditionStats;
  loading?: boolean;
}) {
  return (
    <SimpleGrid columns={{ base: 2, md: 4 }} gap="4">
      <StatCard
        label="Tours termines"
        value={stats.finishedCount}
        icon={LuTrophy}
        color="primary.500"
        loading={loading}
        index={0}
      />
      <StatCard
        label="Distance"
        value={`${stats.distance} km`}
        icon={LuMapPin}
        color="stat.green"
        loading={loading}
        index={1}
      />
      <StatCard
        label="Meilleur temps"
        value={formatTime(stats.bestTime)}
        icon={LuTimer}
        color="stat.blue"
        loading={loading}
        index={2}
      />
      <StatCard
        label="Allure moy."
        value={formatPace(stats.averageTime)}
        icon={LuGauge}
        color="stat.orange"
        loading={loading}
        index={3}
      />
    </SimpleGrid>
  );
}
