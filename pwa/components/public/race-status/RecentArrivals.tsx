"use client";

import {
  Avatar,
  Badge,
  Box,
  Flex,
  Grid,
  HStack,
  Heading,
  Skeleton,
  SkeletonText,
  Text,
  VStack,
} from "@chakra-ui/react";
import type { Participation, Run } from "@/state/race/queries";
import { fmtPace, initials } from "./utils";

type RecentArrivalsProps = {
  isLoading: boolean;
  arrivals: Participation[];
  runs: Run[] | undefined;
  /**
   * Precomputed map(userId → cumulative km) for the current edition. Avoids
   * the O(n×m) scan we used to do per ArrivalCard.
   */
  currentEditionKm?: Map<number, number>;
  now: number;
  /** Map userId → km cumulés sur l'édition précédente (si historique). */
  prevEditionKm?: Map<number, number>;
  prevEditionYear?: number;
  /** Mobile layout (vertical list) vs default (5×2 grid). */
  variant?: "grid" | "list";
};

function allureMoyStr(totalTimeSec?: number | null): string {
  if (!totalTimeSec) return "—";
  return fmtPace(totalTimeSec / 4);
}

export function RecentArrivals({
  isLoading,
  arrivals,
  runs,
  currentEditionKm,
  now,
  prevEditionKm,
  prevEditionYear,
  variant = "grid",
}: RecentArrivalsProps) {
  const isList = variant === "list";

  return (
    <Flex
      direction="column"
      flex="1"
      overflow="hidden"
      borderRightWidth={{ base: 0, md: isList ? 0 : "1px" }}
      borderColor="card.border"
    >
      <Box
        px={{ base: "4", md: "5" }}
        py="2"
        borderBottomWidth="1px"
        borderColor="card.border"
        flexShrink={0}
      >
        <HStack justify="space-between">
          <Heading
            size="md"
            fontWeight="900"
            letterSpacing="tight"
            textTransform="uppercase"
            color="fg"
          >
            Derniers Arrivés
          </Heading>
          <Text
            fontSize="xs"
            color="fg.muted"
            fontWeight="700"
            letterSpacing="widest"
            textTransform="uppercase"
          >
            Live
          </Text>
        </HStack>
      </Box>

      {isList ? (
        <VStack
          align="stretch"
          gap="2"
          flex="1"
          minH="0"
          p="3"
          overflowY="auto"
        >
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} h="16" rounded="xl" />
            ))
          ) : arrivals.length === 0 ? (
            <Flex
              align="center"
              justify="center"
              color="fg.muted"
              fontSize="md"
              flex="1"
              minH="20"
            >
              En attente des arrivées...
            </Flex>
          ) : (
            arrivals.map((p, idx) => (
              <ArrivalCard
                key={p.id}
                p={p}
                idx={idx}
                runs={runs}
                currentEditionKm={currentEditionKm}
                now={now}
                prevEditionKm={prevEditionKm}
                prevEditionYear={prevEditionYear}
                variant="list"
              />
            ))
          )}
        </VStack>
      ) : (
        <Grid
          templateColumns={{
            base: "repeat(2, 1fr)",
            md: "repeat(5, 1fr)",
          }}
          templateRows={{ base: "auto", md: "repeat(2, 1fr)" }}
          gap="2"
          flex="1"
          minH="0"
          p="3"
          overflowY={{ base: "auto", md: "hidden" }}
        >
          {isLoading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <Flex
                key={i}
                direction="column"
                justify="space-between"
                p="3"
                bg="bg.subtle"
                rounded="xl"
                gap="2"
                overflow="hidden"
              >
                <Skeleton h="10" w="10" rounded="full" flexShrink={0} />
                <SkeletonText noOfLines={2} gap="1" />
                <Skeleton h="4" w="full" rounded="md" />
              </Flex>
            ))
          ) : arrivals.length === 0 ? (
            <Flex
              align="center"
              justify="center"
              color="fg.muted"
              fontSize="md"
              gridColumn="1 / -1"
              gridRow="1 / -1"
            >
              En attente des arrivées...
            </Flex>
          ) : (
            arrivals.map((p, idx) => (
              <ArrivalCard
                key={p.id}
                p={p}
                idx={idx}
                runs={runs}
                currentEditionKm={currentEditionKm}
                now={now}
                prevEditionKm={prevEditionKm}
                prevEditionYear={prevEditionYear}
                variant="grid"
              />
            ))
          )}
        </Grid>
      )}
    </Flex>
  );
}

function ArrivalCard({
  p,
  idx,
  runs,
  currentEditionKm,
  now,
  prevEditionKm,
  prevEditionYear,
  variant,
}: {
  p: Participation;
  idx: number;
  runs: Run[] | undefined;
  currentEditionKm?: Map<number, number>;
  now: number;
  prevEditionKm?: Map<number, number>;
  prevEditionYear?: number;
  variant: "grid" | "list";
}) {
  const isFirst = idx === 0;
  const isRecent =
    p.arrivalTime && now - new Date(p.arrivalTime).getTime() < 3 * 60 * 1000;
  const firstName = p.user?.firstName;
  const lastName = p.user?.lastName;
  const surname = p.user?.surname;
  const userImage = p.user?.image;
  const displayName =
    firstName || lastName
      ? `${firstName ?? ""} ${lastName ?? ""}`.trim()
      : "Inconnu";
  const runId = p.run?.id;
  const runNum = runId
    ? (runs?.findIndex((r) => r.id === runId) ?? -1) + 1
    : null;
  const totalKm =
    p.user?.id != null ? (currentEditionKm?.get(p.user.id) ?? 0) : 0;
  const prevKm = p.user?.id != null ? (prevEditionKm?.get(p.user.id) ?? 0) : 0;
  const hasHistory = prevKm > 0 && prevEditionYear;

  if (variant === "list") {
    return (
      <HStack
        bg={isFirst ? "primary.50" : "card.bg"}
        _dark={isFirst ? { bg: "primary.900" } : undefined}
        borderWidth="1px"
        borderColor={isFirst ? "primary.300" : "card.border"}
        rounded="xl"
        px="3"
        py="2.5"
        gap="3"
        shadow="sm"
      >
        <Avatar.Root
          size="md"
          colorPalette={isFirst ? "primary" : "gray"}
          variant="subtle"
          flexShrink={0}
        >
          {userImage && <Avatar.Image src={userImage} alt={displayName} />}
          <Avatar.Fallback>
            {initials(firstName, lastName) || "?"}
          </Avatar.Fallback>
        </Avatar.Root>

        <Box flex="1" minW="0">
          <Text
            fontSize="sm"
            fontWeight="800"
            color="fg"
            lineHeight="1.2"
            truncate
          >
            {displayName}
          </Text>
          {surname && (
            <Text
              fontSize="xs"
              color="fg.muted"
              fontStyle="italic"
              lineHeight="1.2"
              truncate
            >
              «{surname}»
            </Text>
          )}
          <HStack gap="1.5" mt="1" flexWrap="wrap">
            {runNum !== null && runNum > 0 && (
              <Badge size="xs" colorPalette={isFirst ? "primary" : "gray"}>
                R{runNum}
              </Badge>
            )}
            {hasHistory && (
              <Badge size="xs" colorPalette="orange" variant="subtle">
                {prevEditionYear} · {prevKm} km
              </Badge>
            )}
          </HStack>
        </Box>

        <VStack align="flex-end" gap="0" flexShrink={0}>
          <Text
            fontSize="sm"
            fontWeight="900"
            fontVariantNumeric="tabular-nums"
            color={isFirst ? "primary.fg" : "fg"}
            lineHeight="1"
          >
            {p.arrivalTime
              ? new Date(p.arrivalTime).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })
              : "—"}
          </Text>
          <Text fontSize="2xs" color="fg.muted" mt="0.5">
            {allureMoyStr(p.totalTime)} · {totalKm} km
          </Text>
        </VStack>
      </HStack>
    );
  }

  return (
    <Flex
      direction="column"
      justify="space-between"
      p="3"
      bg={isFirst ? "primary.50" : "card.bg"}
      _dark={isFirst ? { bg: "primary.900" } : undefined}
      rounded="xl"
      borderWidth="1px"
      borderColor={
        isFirst ? "primary.300" : isRecent ? "primary.100" : "card.border"
      }
      overflow="hidden"
      gap="2"
    >
      <Flex justify="space-between" align="flex-start">
        <Avatar.Root
          size="lg"
          colorPalette={isFirst ? "primary" : "gray"}
          variant="subtle"
        >
          {userImage && <Avatar.Image src={userImage} alt={displayName} />}
          <Avatar.Fallback fontSize="sm">
            {initials(firstName, lastName) || "?"}
          </Avatar.Fallback>
        </Avatar.Root>
        <VStack align="flex-end" gap="1">
          {runNum !== null && runNum > 0 && (
            <Badge
              size="sm"
              colorPalette={isFirst ? "primary" : "gray"}
              variant="subtle"
            >
              R{runNum}
            </Badge>
          )}
          {hasHistory && (
            <Badge size="xs" colorPalette="orange" variant="subtle">
              {prevEditionYear} · {prevKm} km
            </Badge>
          )}
        </VStack>
      </Flex>

      <Box>
        <Text
          fontSize="sm"
          fontWeight="800"
          color="fg"
          lineHeight="1.3"
          wordBreak="break-word"
        >
          {displayName}
        </Text>
        {surname && (
          <Text
            fontSize="sm"
            color="fg.muted"
            fontStyle="italic"
            lineHeight="1.3"
          >
            «{surname}»
          </Text>
        )}
      </Box>

      <VStack align="stretch" gap="0.5">
        <Text
          fontSize="md"
          fontWeight="900"
          letterSpacing="tight"
          fontVariantNumeric="tabular-nums"
          color={isFirst ? "primary.fg" : "fg"}
          lineHeight="1"
        >
          {p.arrivalTime
            ? new Date(p.arrivalTime).toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })
            : "—"}
        </Text>
        <HStack gap="2">
          <Text fontSize="xs" color="fg.muted" fontWeight="700">
            {allureMoyStr(p.totalTime)}
          </Text>
          <Text fontSize="xs" color="fg.subtle">
            {totalKm} km
          </Text>
        </HStack>
      </VStack>
    </Flex>
  );
}
