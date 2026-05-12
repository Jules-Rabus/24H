"use client";

import {
  Box,
  Flex,
  Grid,
  HStack,
  Progress,
  Skeleton,
  Text,
} from "@chakra-ui/react";
import type { Run } from "@/state/race/queries";
import { StatCard } from "./StatCard";

type StatsPanelProps = {
  isLoading: boolean;
  currentRun: Run | undefined;
  nextRun: Run | undefined;
  runIndex: number;
  totalRuns: number;
  finishedCount: number;
  totalCount: number;
  totalAllKm: number;
  activeRacers: number;
  nextH: number;
  nextM: number;
  nextS: number;
  progressPct: number;
};

export function StatsPanel({
  isLoading,
  currentRun,
  nextRun,
  runIndex,
  totalRuns,
  finishedCount,
  totalCount,
  totalAllKm,
  activeRacers,
  nextH,
  nextM,
  nextS,
  progressPct,
}: StatsPanelProps) {
  return (
    <Flex
      direction="column"
      gap="3"
      p={{ base: "3", md: "4" }}
      borderRightWidth={{ base: 0, md: "1px" }}
      borderColor="card.border"
      overflow="hidden"
    >
      <Grid
        templateColumns={{
          base: "repeat(2, 1fr)",
          md: "repeat(5, 1fr)",
        }}
        gap="3"
        flex="1"
      >
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Flex
              key={i}
              direction="column"
              gap="2"
              p="3"
              bg="card.bg"
              borderWidth="1px"
              borderColor="card.border"
              rounded="xl"
            >
              <Skeleton h="3" w="60%" rounded="md" />
              <Skeleton h="8" w="80%" rounded="md" />
              <Skeleton h="3" w="50%" rounded="md" />
            </Flex>
          ))
        ) : (
          <>
            <StatCard
              label="Run en cours"
              value={
                <Text
                  fontSize={{ base: "sm", md: "md" }}
                  fontWeight="900"
                  color="fg"
                  lineHeight="1.2"
                  truncate
                >
                  {currentRun
                    ? `${new Date(currentRun.startDate!).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} – ${new Date(currentRun.endDate!).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`
                    : "—"}
                </Text>
              }
              sub={
                currentRun ? `Tour ${runIndex} / ${totalRuns}` : "En attente"
              }
            />
            <StatCard
              label="Finishers / Total"
              value={
                <HStack align="baseline" gap="1">
                  <Text
                    fontSize={{ base: "2xl", md: "3xl" }}
                    fontWeight="900"
                    color="primary.fg"
                  >
                    {finishedCount}
                  </Text>
                  <Text fontSize="sm" color="fg.muted">
                    / {totalCount}
                  </Text>
                </HStack>
              }
              sub={`${finishedCount * 4} km ce run`}
            />
            <StatCard
              label="KM Totaux"
              value={
                <HStack align="baseline" gap="1">
                  <Text
                    fontSize={{ base: "2xl", md: "3xl" }}
                    fontWeight="900"
                    color="fg"
                  >
                    {totalAllKm.toLocaleString("fr-FR")}
                  </Text>
                  <Text fontSize="sm" color="fg.muted">
                    km
                  </Text>
                </HStack>
              }
            />
            <StatCard
              label="Coureurs"
              value={
                <HStack align="baseline" gap="1">
                  <Text
                    fontSize={{ base: "2xl", md: "3xl" }}
                    fontWeight="900"
                    color="fg"
                  >
                    {activeRacers}
                  </Text>
                  <Text fontSize="sm" color="fg.muted">
                    coureurs
                  </Text>
                </HStack>
              }
            />
            <StatCard
              label="Prochain départ"
              value={
                <Text
                  fontSize={{ base: "lg", md: "2xl" }}
                  fontWeight="900"
                  color={nextRun && !currentRun ? "primary.fg" : "fg"}
                  fontVariantNumeric="tabular-nums"
                >
                  {nextRun
                    ? `${String(nextH).padStart(2, "0")}:${String(nextM).padStart(2, "0")}:${String(nextS).padStart(2, "0")}`
                    : "—"}
                </Text>
              }
            />
          </>
        )}
      </Grid>

      {/* Progress */}
      <Box flexShrink={0}>
        <HStack justify="space-between" mb="1">
          <Text
            fontSize="xs"
            fontWeight="700"
            letterSpacing="0.1em"
            textTransform="uppercase"
            color="fg.muted"
          >
            Avancement run {runIndex || "—"}
          </Text>
          <Text fontSize="xs" fontWeight="700" color="primary.fg">
            {progressPct}%
          </Text>
        </HStack>
        <Progress.Root
          value={progressPct}
          colorPalette="primary"
          size="md"
          shape="rounded"
        >
          <Progress.Track bg="bg.subtle">
            <Progress.Range />
          </Progress.Track>
        </Progress.Root>
      </Box>
    </Flex>
  );
}
