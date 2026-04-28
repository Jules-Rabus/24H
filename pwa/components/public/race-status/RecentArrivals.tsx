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
  participations: Participation[] | undefined;
  now: number;
};

function runnerTotalKm(
  participations: Participation[] | undefined,
  userId?: number | null,
) {
  if (!userId) return 0;
  return (participations?.filter((p) => p.user?.id === userId).length ?? 0) * 4;
}

function allureMoyStr(totalTimeSec?: number | null): string {
  if (!totalTimeSec) return "—";
  return fmtPace(totalTimeSec / 4);
}

export function RecentArrivals({
  isLoading,
  arrivals,
  runs,
  participations,
  now,
}: RecentArrivalsProps) {
  return (
    <Flex
      direction="column"
      flex="1"
      overflow="hidden"
      borderRightWidth="1px"
      borderColor="whiteAlpha.100"
    >
      <Box
        px="5"
        py="2"
        borderBottomWidth="1px"
        borderColor="whiteAlpha.100"
        flexShrink={0}
      >
        <HStack justify="space-between">
          <Heading
            size="md"
            fontWeight="900"
            letterSpacing="tight"
            textTransform="uppercase"
            color="gray.300"
          >
            Derniers Arrivés
          </Heading>
          <Text
            fontSize="xs"
            color="gray.600"
            fontWeight="700"
            letterSpacing="widest"
            textTransform="uppercase"
          >
            Live
          </Text>
        </HStack>
      </Box>

      <Grid
        templateColumns="repeat(5, 1fr)"
        templateRows="repeat(2, 1fr)"
        gap="2"
        flex="1"
        h="0"
        minH="0"
        p="3"
        overflow="hidden"
      >
        {isLoading ? (
          Array.from({ length: 10 }).map((_, i) => (
            <Flex
              key={i}
              direction="column"
              justify="space-between"
              p="3"
              bg="whiteAlpha.50"
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
            color="gray.600"
            fontSize="md"
            gridColumn="1 / -1"
            gridRow="1 / -1"
          >
            En attente des arrivées...
          </Flex>
        ) : (
          arrivals.map((p, idx) => {
            const isFirst = idx === 0;
            const isRecent =
              p.arrivalTime &&
              now - new Date(p.arrivalTime).getTime() < 3 * 60 * 1000;
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
            const totalKm = runnerTotalKm(participations, p.user?.id);

            return (
              <Flex
                key={p.id}
                direction="column"
                justify="space-between"
                p="3"
                bg={isFirst ? "rgba(15,146,154,0.10)" : "whiteAlpha.50"}
                rounded="xl"
                borderWidth="1px"
                borderColor={
                  isFirst
                    ? "primary.800"
                    : isRecent
                      ? "whiteAlpha.100"
                      : "whiteAlpha.50"
                }
                overflow="hidden"
                gap="2"
              >
                {/* Haut : avatar centré + badge run */}
                <Flex justify="space-between" align="flex-start">
                  <Avatar.Root
                    size="lg"
                    colorPalette={isFirst ? "primary" : "gray"}
                    variant="subtle"
                  >
                    {userImage && (
                      <Avatar.Image
                        src={`${process.env.NEXT_PUBLIC_ENTRYPOINT ?? ""}${userImage}`}
                        alt={displayName}
                      />
                    )}
                    <Avatar.Fallback fontSize="sm">
                      {initials(firstName, lastName) || "?"}
                    </Avatar.Fallback>
                  </Avatar.Root>
                  {runNum !== null && runNum > 0 && (
                    <Badge
                      size="sm"
                      colorPalette={isFirst ? "primary" : "gray"}
                      variant="subtle"
                    >
                      R{runNum}
                    </Badge>
                  )}
                </Flex>

                {/* Nom + surnom sur toute la largeur */}
                <Box>
                  <Text
                    fontSize="sm"
                    fontWeight="800"
                    color={isFirst ? "primary.200" : "gray.200"}
                    lineHeight="1.3"
                    wordBreak="break-word"
                  >
                    {displayName}
                  </Text>
                  {surname && (
                    <Text
                      fontSize="sm"
                      color="gray.400"
                      fontStyle="italic"
                      lineHeight="1.3"
                    >
                      «{surname}»
                    </Text>
                  )}
                </Box>

                {/* Stats : heure + allure + km */}
                <VStack align="stretch" gap="0.5">
                  <Text
                    fontSize="md"
                    fontWeight="900"
                    letterSpacing="tight"
                    fontVariantNumeric="tabular-nums"
                    color={isFirst ? "primary.300" : "gray.300"}
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
                    <Text fontSize="xs" color="gray.400" fontWeight="700">
                      {allureMoyStr(p.totalTime)}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      {totalKm} km
                    </Text>
                  </HStack>
                </VStack>
              </Flex>
            );
          })
        )}
      </Grid>
    </Flex>
  );
}
