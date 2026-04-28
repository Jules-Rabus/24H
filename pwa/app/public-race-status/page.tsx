"use client";

import { Box, Flex, Grid } from "@chakra-ui/react";
import { useWeatherQuery } from "@/state/weather/queries";
import { useParticipationsQuery, useRunsQuery } from "@/state/race/queries";
import { useAdminRaceMediasQuery } from "@/state/admin/medias/queries";
import { useRaceStatusLive } from "@/state/public/useRaceStatusLive";
import { TopBar } from "@/components/public/race-status/TopBar";
import { StatsPanel } from "@/components/public/race-status/StatsPanel";
import { WeatherPanel } from "@/components/public/race-status/WeatherPanel";
import { MediaCarousel } from "@/components/public/race-status/MediaCarousel";
import { QrPanel } from "@/components/public/race-status/QrPanel";
import { RecentArrivals } from "@/components/public/race-status/RecentArrivals";
import { PaceBarChart } from "@/components/public/race-status/PaceBarChart";

const LATITUDE = 49.4326;
const LONGITUDE = 2.0886;

export default function PublicRaceStatusPage() {
  const { data: weatherData, isLoading: isWeatherLoading } = useWeatherQuery(
    LATITUDE,
    LONGITUDE,
  );
  const { data: participations, isLoading: isParticipationsLoading } =
    useParticipationsQuery();
  const { data: runs, isLoading: isRunsLoading } = useRunsQuery();
  const { data: medias, isLoading: isMediasLoading } =
    useAdminRaceMediasQuery();

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

  // Chart: allure moyen par run en secondes/km (stored), formatted as mm:ss/km on axis
  const chartData = (runs ?? []).map((r, i) => {
    const runParts =
      participations?.filter(
        (p) => p.run?.id === r.id && p.totalTime != null,
      ) ?? [];
    const avgSec =
      runParts.length > 0
        ? runParts.reduce((s, p) => s + (p.totalTime ?? 0), 0) / runParts.length
        : 0;
    // secPerKm = avgSec / 4 (4km per run)
    const secPerKm = avgSec > 0 ? Math.round(avgSec / 4) : 0;
    return { name: `R${i + 1}`, secPerKm, isCurrent: r.id === currentRun?.id };
  });

  const lastArrivals = participations?.slice(0, 10) ?? [];

  const currentTemp = weatherData?.current.temperature_2m ?? "--";
  const currentWeatherCode = weatherData?.current.weather_code ?? 0;

  return (
    <Box
      w="100vw"
      h="100vh"
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
          isLoading={isRunsLoading || isParticipationsLoading}
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

      {/* ── BLOC 2 : MÉDIAS + QR ── */}
      <Grid
        templateColumns="2fr 1fr"
        flexShrink={0}
        borderBottomWidth="1px"
        borderColor="whiteAlpha.100"
        style={{ height: "26%" }}
      >
        <MediaCarousel isLoading={isMediasLoading} medias={medias ?? []} />
        <QrPanel />
      </Grid>

      {/* ── BLOC 3 : DERNIERS ARRIVÉS + CHART ── */}
      <Flex flex="1" overflow="hidden">
        <RecentArrivals
          isLoading={isParticipationsLoading}
          arrivals={lastArrivals}
          runs={runs}
          participations={participations}
          now={now}
        />
        <PaceBarChart data={chartData} />
      </Flex>
    </Box>
  );
}
