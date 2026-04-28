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
      p="4"
      borderRightWidth="1px"
      borderColor="whiteAlpha.100"
      overflow="hidden"
    >
      <Grid templateColumns="repeat(5, 1fr)" gap="3" flex="1">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Flex
              key={i}
              direction="column"
              gap="2"
              p="3"
              bg="whiteAlpha.50"
              rounded="xl"
              borderLeftWidth="2px"
              borderLeftColor="whiteAlpha.100"
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
                  fontSize="md"
                  fontWeight="900"
                  color="gray.100"
                  lineHeight="1.2"
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
                  <Text fontSize="3xl" fontWeight="900" color="primary.300">
                    {finishedCount}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
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
                  <Text fontSize="3xl" fontWeight="900" color="gray.100">
                    {totalAllKm.toLocaleString("fr-FR")}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    km
                  </Text>
                </HStack>
              }
            />
            <StatCard
              label="Coureurs"
              value={
                <HStack align="baseline" gap="1">
                  <Text fontSize="3xl" fontWeight="900" color="gray.100">
                    {activeRacers}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    coureurs
                  </Text>
                </HStack>
              }
            />
            <StatCard
              label="Prochain départ"
              value={
                <Text
                  fontSize="2xl"
                  fontWeight="900"
                  color={nextRun && !currentRun ? "primary.300" : "gray.100"}
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
            color="gray.600"
          >
            Avancement run {runIndex}
          </Text>
          <Text fontSize="xs" fontWeight="700" color="primary.400">
            {progressPct}%
          </Text>
        </HStack>
        <Progress.Root
          value={progressPct}
          colorPalette="primary"
          size="md"
          shape="rounded"
        >
          <Progress.Track bg="whiteAlpha.100">
            <Progress.Range />
          </Progress.Track>
        </Progress.Root>
      </Box>
    </Flex>
  );
}
