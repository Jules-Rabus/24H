"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Box, Flex, Grid, Heading, HStack, Text } from "@chakra-ui/react";
import { useWeatherQuery } from "@/state/weather/queries";
import { usePublicRaceMediasQuery } from "@/state/public/raceStatusQueries";
import { useRaceStatus } from "@/hooks/useRaceStatus";
import { PublicNav } from "@/components/public/PublicNav";
import { PublicBottomBarSpacer } from "@/components/public/PublicBottomBar";
import { StatsPanel } from "@/components/public/race-status/StatsPanel";
import { WeatherCarouselMobile } from "@/components/public/race-status/WeatherCarouselMobile";
import { WeatherPanel } from "@/components/public/race-status/WeatherPanel";
import { MediaCarousel } from "@/components/public/race-status/MediaCarousel";
import { RecentArrivals } from "@/components/public/race-status/RecentArrivals";
import { PaceLineChart } from "@/components/public/race-status/PaceLineChart";

const LATITUDE = 49.4326;
const LONGITUDE = 2.0886;

function CourseContent() {
  const searchParams = useSearchParams();
  const edition = Number(searchParams.get("edition")) || 2026;

  const { data: weatherData, isLoading: isWeatherLoading } = useWeatherQuery(
    LATITUDE,
    LONGITUDE,
  );
  const { data: medias, isLoading: isMediasLoading } =
    usePublicRaceMediasQuery();

  const {
    isLoading,
    isParticipationsLoading,
    runs,
    participations,
    now,
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
  } = useRaceStatus(edition);

  const lastArrivals = participations?.slice(0, 8) ?? [];

  return (
    <Box minH="100svh" bg="bg.subtle" display="flex" flexDirection="column">
      <PublicNav />

      <Box
        flex="1"
        maxW="6xl"
        mx="auto"
        w="full"
        px={{ base: "3", md: "6" }}
        py={{ base: "3", md: "5" }}
      >
        <Flex direction="column" gap={{ base: "3", md: "4" }}>
          {/* Header compact mobile */}
          <Flex
            align="center"
            justify="space-between"
            display={{ base: "flex", md: "none" }}
          >
            <Box>
              <Heading size="xl" fontWeight="extrabold" letterSpacing="tight">
                Course
              </Heading>
              <Text fontSize="xs" color="fg.muted">
                UniLaSalle Beauvais · Édition {edition}
              </Text>
            </Box>
            {currentRun && (
              <HStack
                bg="primary.50"
                _dark={{ bg: "primary.900" }}
                color="primary.fg"
                rounded="full"
                px="2.5"
                py="1"
                gap="1.5"
              >
                <Box
                  w="1.5"
                  h="1.5"
                  rounded="full"
                  bg="primary.500"
                  css={{
                    animation: "pulse 1.5s infinite",
                    "@keyframes pulse": {
                      "0%, 100%": { opacity: 1 },
                      "50%": { opacity: 0.4 },
                    },
                  }}
                />
                <Text fontSize="2xs" fontWeight="bold" letterSpacing="wider">
                  RUN {runIndex}/{totalRuns}
                </Text>
              </HStack>
            )}
          </Flex>

          {/* Bloc 1 : Stats */}
          <Box
            bg="card.bg"
            borderWidth="1px"
            borderColor="card.border"
            rounded="2xl"
            shadow="sm"
            overflow="hidden"
          >
            <StatsPanel
              isLoading={isLoading}
              currentRun={currentRun}
              nextRun={nextRun}
              runIndex={runIndex}
              totalRuns={totalRuns}
              finishedCount={finishedCount}
              totalCount={totalCount}
              totalAllKm={totalAllKm}
              activeRacers={activeRacers}
              nextH={nextH}
              nextM={nextM}
              nextS={nextS}
              progressPct={progressPct}
            />
          </Box>

          {/* Météo : carousel mobile, panel complet desktop */}
          <Box display={{ base: "block", md: "none" }}>
            <WeatherCarouselMobile
              isLoading={isWeatherLoading}
              weatherData={weatherData}
            />
          </Box>
          <Box
            display={{ base: "none", md: "block" }}
            bg="card.bg"
            borderWidth="1px"
            borderColor="card.border"
            rounded="2xl"
            shadow="sm"
            overflow="hidden"
          >
            <WeatherPanel
              isLoading={isWeatherLoading}
              weatherData={weatherData}
              now={now}
            />
          </Box>

          {/* Médias */}
          <Box
            bg="card.bg"
            borderWidth="1px"
            borderColor="card.border"
            rounded="2xl"
            shadow="sm"
            overflow="hidden"
          >
            <Box display={{ base: "block", md: "none" }}>
              <MediaCarousel
                isLoading={isMediasLoading}
                medias={medias ?? []}
                variant="mobile"
              />
            </Box>
            <Box display={{ base: "none", md: "block" }}>
              <MediaCarousel
                isLoading={isMediasLoading}
                medias={medias ?? []}
                variant="desktop"
              />
            </Box>
          </Box>

          {/* Derniers arrivés + Chart */}
          <Grid
            templateColumns={{ base: "1fr", md: "2fr 1fr" }}
            gap={{ base: "3", md: "4" }}
          >
            <Box
              bg="card.bg"
              borderWidth="1px"
              borderColor="card.border"
              rounded="2xl"
              shadow="sm"
              overflow="hidden"
              minH={{ base: "20", md: "96" }}
            >
              <RecentArrivals
                isLoading={isParticipationsLoading}
                arrivals={lastArrivals}
                runs={runs}
                currentEditionKm={currentEditionKm}
                now={now}
                prevEditionKm={prevEditionKm}
                prevEditionYear={prevEdition}
                variant="grid"
              />
            </Box>
            <Box
              bg="card.bg"
              borderWidth="1px"
              borderColor="card.border"
              rounded="2xl"
              shadow="sm"
              overflow="hidden"
              minH={{ base: "60", md: "96" }}
            >
              <PaceLineChart data={chartData} fluid />
            </Box>
          </Grid>
        </Flex>
      </Box>

      <PublicBottomBarSpacer />
    </Box>
  );
}

export default function CoursePage() {
  return (
    <Suspense>
      <CourseContent />
    </Suspense>
  );
}
