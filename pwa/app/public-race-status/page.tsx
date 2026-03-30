"use client";

import {
  Box,
  Flex,
  Grid,
  HStack,
  VStack,
  Text,
  Heading,
  Avatar,
  Icon,
  Progress,
  Badge,
} from "@chakra-ui/react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useQueryClient } from "@tanstack/react-query";
import { useWeatherQuery } from "@/state/weather/queries";
import {
  useParticipationsQuery,
  useRunsQuery,
  raceKeys,
} from "@/state/race/queries";
import { useAdminRaceMediasQuery } from "@/state/admin/medias/queries";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  LuSun,
  LuCloudRain,
  LuCloud,
  LuCloudLightning,
  LuWind,
  LuDroplets,
  LuThermometer,
  LuQrCode,
  LuChevronLeft,
  LuChevronRight,
  LuCamera,
} from "react-icons/lu";

const LATITUDE = 49.4326;
const LONGITUDE = 2.0886;
const TEAL = "#0f929a";

function getWeatherIcon(code: number) {
  if (code <= 3) return LuSun;
  if (code <= 48) return LuCloud;
  if (code <= 67) return LuCloudRain;
  if (code <= 99) return LuCloudLightning;
  return LuSun;
}

function fmtRunTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0)
    return `${h}h${String(m).padStart(2, "0")}m${String(s).padStart(2, "0")}s`;
  return `${m}m${String(s).padStart(2, "0")}s`;
}

/** Format seconds-per-km as mm:ss/km */
function fmtPace(secPerKm: number): string {
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return `${m}:${String(s).padStart(2, "0")}/km`;
}

function initials(firstName?: string | null, lastName?: string | null) {
  return `${(firstName?.[0] ?? "").toUpperCase()}${(lastName?.[0] ?? "").toUpperCase()}`;
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
}) {
  return (
    <Flex
      direction="column"
      justify="space-between"
      p="3"
      bg="whiteAlpha.50"
      rounded="xl"
      borderLeftWidth="2px"
      borderLeftColor="primary.500"
      overflow="hidden"
    >
      <Text
        fontSize="xs"
        fontWeight="700"
        letterSpacing="0.12em"
        textTransform="uppercase"
        color="gray.500"
      >
        {label}
      </Text>
      <Box mt="1">
        <Box>{value}</Box>
        {sub && (
          <Text fontSize="xs" color="gray.500" mt="0.5">
            {sub}
          </Text>
        )}
      </Box>
    </Flex>
  );
}

export default function PublicRaceStatusPage() {
  const queryClient = useQueryClient();
  const { data: weatherData } = useWeatherQuery(LATITUDE, LONGITUDE);
  const { data: participations } = useParticipationsQuery();
  const { data: runs } = useRunsQuery();
  const { data: medias } = useAdminRaceMediasQuery();

  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  // Embla carousel — 3 slides visible, autoplay 4s
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    slidesToScroll: 3,
    align: "start",
  });
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  // Manual autoplay (mediaList.length computed below — use medias count here)
  const autoplayTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaCount = medias?.filter((m) => m.contentUrl).length ?? 0;
  useEffect(() => {
    if (!emblaApi || mediaCount <= 3) return;
    autoplayTimer.current = setInterval(() => emblaApi.scrollNext(), 4000);
    return () => {
      if (autoplayTimer.current) clearInterval(autoplayTimer.current);
    };
  }, [emblaApi, mediaCount]);

  useEffect(() => {
    setCurrentTime(new Date()); // eslint-disable-line react-hooks/set-state-in-effect
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Mercure
  useEffect(() => {
    const hubUrl = process.env.NEXT_PUBLIC_MERCURE_HUB_URL;
    const entrypoint = process.env.NEXT_PUBLIC_ENTRYPOINT;
    if (!hubUrl || !entrypoint) return;
    const url = new URL(hubUrl);
    url.searchParams.append("topic", `${entrypoint}/participations/{id}`);
    const es = new EventSource(url.toString(), { withCredentials: true });
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.status === "FINISHED") {
          queryClient.setQueryData(
            raceKeys.participations(),
            (old: unknown) => {
              if (!Array.isArray(old)) return old;
              if (old.find((p: { id: number }) => p.id === data.id)) return old;
              return [data, ...old].sort(
                (a: { arrivalTime?: string }, b: { arrivalTime?: string }) => {
                  const tA = a.arrivalTime
                    ? new Date(a.arrivalTime).getTime()
                    : 0;
                  const tB = b.arrivalTime
                    ? new Date(b.arrivalTime).getTime()
                    : 0;
                  return tB - tA;
                },
              );
            },
          );
          queryClient.invalidateQueries({ queryKey: raceKeys.runs() });
        }
      } catch {}
    };
    return () => es.close();
  }, [queryClient]);

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

  function runnerTotalKm(userId?: number | null) {
    if (!userId) return 0;
    return (
      (participations?.filter((p) => p.user?.id === userId).length ?? 0) * 4
    );
  }

  function allureMoyStr(totalTimeSec?: number | null): string {
    if (!totalTimeSec) return "—";
    return fmtPace(totalTimeSec / 4);
  }

  const currentTemp = weatherData?.current.temperature_2m ?? "--";
  const apparentTemp = weatherData?.current.apparent_temperature;
  const windSpeed = weatherData?.current.windspeed_10m;
  const humidity = weatherData?.current.relative_humidity_2m;
  const currentWeatherCode = weatherData?.current.weather_code ?? 0;
  const WeatherIcon = getWeatherIcon(currentWeatherCode);

  const hourlyForecast =
    weatherData?.hourly.time
      .map((t, i) => ({
        time: t,
        temp: weatherData.hourly.temperature_2m[i],
        code: weatherData.hourly.weather_code[i],
      }))
      .filter((h) => new Date(h.time).getTime() > now)
      .slice(0, 5) ?? [];

  const mediaList = medias?.filter((m) => m.contentUrl) ?? [];

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
      {/* ── TOP BAR ── */}
      <Flex
        align="center"
        justify="space-between"
        px="6"
        py="2"
        flexShrink={0}
        borderBottomWidth="1px"
        borderColor="whiteAlpha.100"
        bg="blackAlpha.400"
      >
        <HStack gap="4">
          <Box
            w="2.5"
            h="2.5"
            rounded="full"
            flexShrink={0}
            bg={currentRun ? "primary.400" : "gray.500"}
            boxShadow={currentRun ? `0 0 8px ${TEAL}` : undefined}
          />
          <Heading
            size="md"
            fontWeight="900"
            letterSpacing="tighter"
            textTransform="uppercase"
            color="gray.200"
          >
            DÉFI 24H — UniLaSalle Beauvais
          </Heading>
          {currentRun && (
            <Badge
              colorPalette="primary"
              variant="outline"
              fontSize="xs"
              fontWeight="800"
              letterSpacing="wider"
            >
              RUN {runIndex}/{totalRuns}
            </Badge>
          )}
        </HStack>
        <HStack gap="6">
          <HStack gap="2" color="gray.400">
            <Icon as={WeatherIcon} boxSize="5" />
            <Text fontWeight="700" fontSize="lg">
              {currentTemp}°C
            </Text>
          </HStack>
          <Text
            fontWeight="900"
            fontSize="2xl"
            letterSpacing="tight"
            fontVariantNumeric="tabular-nums"
            color="gray.100"
          >
            {currentTime?.toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }) ?? "--:--:--"}
          </Text>
        </HStack>
      </Flex>

      {/* ── BLOC 1 : STATS + MÉTÉO ── */}
      <Grid
        templateColumns="2fr 1fr"
        flexShrink={0}
        borderBottomWidth="1px"
        borderColor="whiteAlpha.100"
        style={{ height: "28%" }}
      >
        {/* Stats */}
        <Flex
          direction="column"
          gap="3"
          p="4"
          borderRightWidth="1px"
          borderColor="whiteAlpha.100"
          overflow="hidden"
        >
          <Grid templateColumns="repeat(5, 1fr)" gap="3" flex="1">
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

        {/* Météo */}
        <Flex direction="column" gap="2" p="4" overflow="hidden">
          {/* Actuelle — grande */}
          <Flex
            align="center"
            justify="space-between"
            flexShrink={0}
            p="3"
            bg="whiteAlpha.50"
            rounded="xl"
          >
            <Box>
              <Text
                fontSize="xs"
                fontWeight="700"
                letterSpacing="0.12em"
                textTransform="uppercase"
                color="gray.500"
                mb="1"
              >
                Météo actuelle
              </Text>
              <HStack gap="3" align="baseline">
                <Text
                  fontSize="4xl"
                  fontWeight="900"
                  color="gray.100"
                  lineHeight="1"
                >
                  {currentTemp}°C
                </Text>
                <Icon as={WeatherIcon} boxSize="8" color="primary.300" />
              </HStack>
            </Box>
            <Grid templateColumns="1fr 1fr" gap="2">
              {apparentTemp !== undefined && (
                <HStack gap="1.5" p="2" bg="whiteAlpha.50" rounded="lg">
                  <Icon as={LuThermometer} boxSize="4" color="gray.400" />
                  <Box>
                    <Text
                      fontSize="10px"
                      color="gray.500"
                      textTransform="uppercase"
                      letterSpacing="wider"
                    >
                      Ressenti
                    </Text>
                    <Text fontSize="sm" fontWeight="800" color="gray.200">
                      {apparentTemp}°C
                    </Text>
                  </Box>
                </HStack>
              )}
              {windSpeed !== undefined && (
                <HStack gap="1.5" p="2" bg="whiteAlpha.50" rounded="lg">
                  <Icon as={LuWind} boxSize="4" color="gray.400" />
                  <Box>
                    <Text
                      fontSize="10px"
                      color="gray.500"
                      textTransform="uppercase"
                      letterSpacing="wider"
                    >
                      Vent
                    </Text>
                    <Text fontSize="sm" fontWeight="800" color="gray.200">
                      {windSpeed} km/h
                    </Text>
                  </Box>
                </HStack>
              )}
              {humidity !== undefined && (
                <HStack gap="1.5" p="2" bg="whiteAlpha.50" rounded="lg">
                  <Icon as={LuDroplets} boxSize="4" color="gray.400" />
                  <Box>
                    <Text
                      fontSize="10px"
                      color="gray.500"
                      textTransform="uppercase"
                      letterSpacing="wider"
                    >
                      Humidité
                    </Text>
                    <Text fontSize="sm" fontWeight="800" color="gray.200">
                      {humidity}%
                    </Text>
                  </Box>
                </HStack>
              )}
            </Grid>
          </Flex>

          {/* Prévisions horaires */}
          {hourlyForecast.length > 0 && (
            <HStack gap="1.5" flex="1" align="stretch">
              {hourlyForecast.map((h, i) => {
                const HIcon = getWeatherIcon(h.code);
                return (
                  <Flex
                    key={i}
                    direction="column"
                    align="center"
                    justify="space-between"
                    flex="1"
                    p="2"
                    bg="whiteAlpha.50"
                    rounded="lg"
                    borderTopWidth="2px"
                    borderTopColor={i === 0 ? "primary.500" : "transparent"}
                  >
                    <Text fontSize="xs" color="gray.500" fontWeight="600">
                      {new Date(h.time).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                    <Icon
                      as={HIcon}
                      boxSize="5"
                      color={i === 0 ? "primary.300" : "gray.500"}
                    />
                    <Text
                      fontSize="md"
                      fontWeight="900"
                      color={i === 0 ? "gray.100" : "gray.400"}
                    >
                      {h.temp}°
                    </Text>
                  </Flex>
                );
              })}
            </HStack>
          )}
        </Flex>
      </Grid>

      {/* ── BLOC 2 : MÉDIAS + QR ── */}
      <Grid
        templateColumns="2fr 1fr"
        flexShrink={0}
        borderBottomWidth="1px"
        borderColor="whiteAlpha.100"
        style={{ height: "26%" }}
      >
        {/* Carousel médias — Embla, 3 slides visibles */}
        <Box
          position="relative"
          overflow="hidden"
          borderRightWidth="1px"
          borderColor="whiteAlpha.100"
          bg="gray.900"
          p="3"
        >
          {mediaList.length === 0 ? (
            <Flex
              direction="column"
              align="center"
              justify="center"
              h="full"
              gap="3"
              color="gray.500"
            >
              <Icon as={LuCamera} boxSize="12" color="gray.700" />
              <Box textAlign="center">
                <Text fontSize="md" fontWeight="700" color="gray.400">
                  Aucune photo pour le moment
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Scannez le QR code pour partager votre moment !
                </Text>
              </Box>
            </Flex>
          ) : (
            <Flex h="full" direction="column" gap="2">
              {/* Embla viewport */}
              <Box overflow="hidden" flex="1" ref={emblaRef}>
                <Flex h="full" gap="2">
                  {mediaList.map((m, i) => (
                    <Box
                      key={m.id ?? i}
                      flexShrink={0}
                      style={{ flex: "0 0 calc(33.333% - 6px)" }}
                      rounded="xl"
                      overflow="hidden"
                      bg="gray.800"
                      position="relative"
                      display="flex"
                      flexDirection="column"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m.contentUrl ?? ""}
                        alt="Race media"
                        style={{
                          width: "100%",
                          flex: 1,
                          objectFit: "contain",
                          minHeight: 0,
                        }}
                      />
                      {m.comment && (
                        <Box px="2" py="1.5" bg="blackAlpha.800" flexShrink={0}>
                          <Text
                            fontSize="11px"
                            color="whiteAlpha.900"
                            lineClamp={2}
                          >
                            {m.comment}
                          </Text>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Flex>
              </Box>
              {/* Controls */}
              <HStack justify="space-between" flexShrink={0} px="1">
                <Text fontSize="xs" color="gray.600" fontWeight="700">
                  {mediaList.length} photo{mediaList.length > 1 ? "s" : ""}
                </Text>
                <HStack gap="2">
                  <Box
                    as="button"
                    onClick={scrollPrev}
                    p="1.5"
                    rounded="full"
                    bg="whiteAlpha.100"
                    color="white"
                    cursor="pointer"
                    _hover={{ bg: "whiteAlpha.200" }}
                  >
                    <Icon as={LuChevronLeft} boxSize="4" />
                  </Box>
                  <Box
                    as="button"
                    onClick={scrollNext}
                    p="1.5"
                    rounded="full"
                    bg="whiteAlpha.100"
                    color="white"
                    cursor="pointer"
                    _hover={{ bg: "whiteAlpha.200" }}
                  >
                    <Icon as={LuChevronRight} boxSize="4" />
                  </Box>
                </HStack>
              </HStack>
            </Flex>
          )}
        </Box>

        {/* QR Code */}
        <Flex
          direction="column"
          align="center"
          justify="center"
          gap="3"
          p="5"
          bg="gray.900"
        >
          <Icon as={LuQrCode} boxSize="7" color="primary.400" />
          <Text
            fontSize="xs"
            fontWeight="700"
            letterSpacing="0.2em"
            textTransform="uppercase"
            color="gray.500"
          >
            Photo Wall
          </Text>
          <Text
            fontSize="xl"
            fontWeight="900"
            letterSpacing="tight"
            textTransform="uppercase"
            color="gray.100"
            textAlign="center"
            lineHeight="1.2"
          >
            PARTAGEZ
            <br />
            VOTRE MOMENT
          </Text>
          <Box bg="white" p="2" rounded="xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${process.env.NEXT_PUBLIC_ENTRYPOINT}/upload`}
              alt="QR Code upload"
              width={110}
              height={110}
            />
          </Box>
          <Text
            fontSize="xs"
            color="primary.400"
            fontWeight="600"
            letterSpacing="0.1em"
            textTransform="uppercase"
          >
            Scannez pour uploader
          </Text>
        </Flex>
      </Grid>

      {/* ── BLOC 3 : DERNIERS ARRIVÉS + CHART ── */}
      <Flex flex="1" overflow="hidden">
        {/* Derniers arrivés */}
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
            {lastArrivals.length === 0 ? (
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
              lastArrivals.map((p, idx) => {
                const isFirst = idx === 0;
                const isRecent =
                  p.arrivalTime &&
                  now - new Date(p.arrivalTime).getTime() < 3 * 60 * 1000;
                const firstName = p.user?.firstName;
                const lastName = p.user?.lastName;
                const surname = p.user?.surname;
                const displayName =
                  firstName || lastName
                    ? `${firstName ?? ""} ${lastName ?? ""}`.trim()
                    : "Inconnu";
                const runId = p.run?.id;
                const runNum = runId
                  ? (runs?.findIndex((r) => r.id === runId) ?? -1) + 1
                  : null;
                const totalKm = runnerTotalKm(p.user?.id);

                return (
                  <Flex
                    key={p.id}
                    direction="column"
                    justify="space-between"
                    p="2.5"
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
                  >
                    {/* Ligne 1: avatar + nom + badge run */}
                    <HStack gap="2" justify="space-between" align="flex-start">
                      <HStack gap="2" align="center" overflow="hidden">
                        <Avatar.Root
                          size="sm"
                          colorPalette={isFirst ? "primary" : "gray"}
                          variant="subtle"
                          flexShrink={0}
                        >
                          <Avatar.Fallback fontSize="xs">
                            {initials(firstName, lastName) || "?"}
                          </Avatar.Fallback>
                        </Avatar.Root>
                        <Box overflow="hidden">
                          <Text
                            fontSize="sm"
                            fontWeight="700"
                            color={isFirst ? "primary.200" : "gray.200"}
                            lineHeight="1.2"
                            truncate
                          >
                            {displayName}
                          </Text>
                          {surname && (
                            <Text
                              fontSize="xs"
                              color="gray.500"
                              fontStyle="italic"
                              lineHeight="1"
                            >
                              «{surname}»
                            </Text>
                          )}
                        </Box>
                      </HStack>
                      {runNum !== null && runNum > 0 && (
                        <Badge
                          size="sm"
                          colorPalette={isFirst ? "primary" : "gray"}
                          variant="subtle"
                          fontSize="xs"
                          flexShrink={0}
                        >
                          R{runNum}
                        </Badge>
                      )}
                    </HStack>

                    {/* Ligne 2: heure arrivée + allure + km total */}
                    <HStack gap="2" justify="space-between" align="flex-end">
                      <Box>
                        <Text
                          fontSize="10px"
                          color="gray.600"
                          textTransform="uppercase"
                          letterSpacing="0.05em"
                        >
                          Arrivée
                        </Text>
                        <Text
                          fontSize="md"
                          fontWeight="900"
                          letterSpacing="tight"
                          fontVariantNumeric="tabular-nums"
                          color={isFirst ? "primary.300" : "gray.300"}
                        >
                          {p.arrivalTime
                            ? new Date(p.arrivalTime).toLocaleTimeString(
                                "fr-FR",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                },
                              )
                            : "—"}
                        </Text>
                      </Box>
                      <VStack align="flex-end" gap="0">
                        <Text fontSize="xs" color="gray.400" fontWeight="700">
                          {allureMoyStr(p.totalTime)}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          {totalKm} km total
                        </Text>
                      </VStack>
                    </HStack>
                  </Flex>
                );
              })
            )}
          </Grid>
        </Flex>

        {/* Chart allure moyen — 1/3 */}
        <Flex
          direction="column"
          style={{ width: "33%" }}
          flexShrink={0}
          p="4"
          gap="2"
          overflow="hidden"
        >
          <Heading
            size="sm"
            fontWeight="900"
            letterSpacing="tight"
            textTransform="uppercase"
            color="gray.400"
            flexShrink={0}
          >
            Allure moy. / Run
          </Heading>
          {chartData.some((d) => d.secPerKm > 0) ? (
            <Box flex="1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 4, right: 8, bottom: 0, left: 8 }}
                >
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => (v > 0 ? fmtPace(v) : "")}
                    width={52}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#111827",
                      border: "none",
                      borderRadius: 6,
                      fontSize: 12,
                      color: "#e5e7eb",
                    }}
                    formatter={(v) => [fmtPace(Number(v ?? 0)), "Allure moy."]}
                  />
                  <Bar dataKey="secPerKm" radius={[3, 3, 0, 0]}>
                    {chartData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.isCurrent ? TEAL : "rgba(255,255,255,0.12)"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <Flex
              flex="1"
              align="center"
              justify="center"
              color="gray.700"
              fontSize="sm"
              textAlign="center"
            >
              Données insuffisantes
            </Flex>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}
