"use client";

import { Box, Flex, Grid } from "@chakra-ui/react";
import { useWeatherQuery } from "@/state/weather/queries";
import { usePublicRaceMediasQuery } from "@/state/public/raceStatusQueries";
import { useRaceStatus } from "@/hooks/useRaceStatus";
import { TopBar } from "@/components/public/race-status/TopBar";
import { StatsPanel } from "@/components/public/race-status/StatsPanel";
import { WeatherPanel } from "@/components/public/race-status/WeatherPanel";
import { MediaCarousel } from "@/components/public/race-status/MediaCarousel";
import { QrPanel } from "@/components/public/race-status/QrPanel";
import { RecentArrivals } from "@/components/public/race-status/RecentArrivals";
import { PaceLineChart } from "@/components/public/race-status/PaceLineChart";

const LATITUDE = 49.4326;
const LONGITUDE = 2.0886;
// Hardcoded — this display is meant to be projected during the live event
// (the year is known when the race opens), so we don't derive it from the URL.
const CURRENT_EDITION = 2026;

/**
 * Display grand écran (vidéoprojecteur / TV) du statut de la course.
 *
 * Mêmes données et composants que `/course` (page publique mobile) — via le
 * hook partagé `useRaceStatus` — mais avec un layout fixé en plein écran
 * 100svh/100vw + le QrPanel "PARTAGEZ VOTRE MOMENT" en plus. Aucune
 * authentification requise.
 */
export default function PublicRaceStatusPage() {
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
    currentTime,
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
  } = useRaceStatus(CURRENT_EDITION);

  const lastArrivals = participations?.slice(0, 10) ?? [];

  const currentTemp = weatherData?.current.temperature_2m ?? "--";
  const currentWeatherCode = weatherData?.current.weather_code ?? 0;

  return (
    <Box
      w="100vw"
      h="100svh"
      overflow="hidden"
      bg="gray.950"
      color="gray.100"
      display="flex"
      flexDirection="column"
      colorPalette="primary"
    >
      <TopBar
        currentTime={currentTime}
        hasCurrentRun={Boolean(currentRun)}
        runIndex={runIndex}
        totalRuns={totalRuns}
        currentTemp={currentTemp}
        currentWeatherCode={currentWeatherCode}
      />

      {/* ── BLOC 1 : STATS + MÉTÉO ── */}
      <Grid
        templateColumns="2fr 1fr"
        flexShrink={0}
        borderBottomWidth="1px"
        borderColor="whiteAlpha.100"
        style={{ height: "28%" }}
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
        <WeatherPanel
          isLoading={isWeatherLoading}
          weatherData={weatherData}
          now={now}
        />
      </Grid>

      {/* ── BLOC 2 : MÉDIAS + QR "PARTAGEZ VOTRE MOMENT" ── */}
      <Grid
        templateColumns="2fr 1fr"
        flexShrink={0}
        borderBottomWidth="1px"
        borderColor="whiteAlpha.100"
        style={{ height: "26%" }}
      >
        <MediaCarousel
          isLoading={isMediasLoading}
          medias={medias ?? []}
          variant="desktop"
        />
        <QrPanel />
      </Grid>

      {/* ── BLOC 3 : DERNIERS ARRIVÉS + CHART ── */}
      <Flex flex="1" overflow="hidden">
        <RecentArrivals
          isLoading={isParticipationsLoading}
          arrivals={lastArrivals}
          runs={runs}
          currentEditionKm={currentEditionKm}
          now={now}
          prevEditionKm={prevEditionKm}
          prevEditionYear={prevEdition}
        />
        <PaceLineChart data={chartData} />
      </Flex>
    </Box>
  );
}
