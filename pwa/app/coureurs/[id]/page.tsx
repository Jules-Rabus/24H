"use client";

import { use, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Heading,
  HStack,
  SimpleGrid,
  Spinner,
  Table,
  Tabs,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  LuArrowLeft,
  LuTrophy,
  LuMapPin,
  LuTimer,
  LuGauge,
  LuActivity,
  LuScale,
} from "react-icons/lu";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { PublicNav } from "@/components/public/PublicNav";
import { StatCard } from "@/components/admin/ui/StatCard";
import { usePublicRunnerQuery } from "@/state/public/queries";
import type { PublicParticipation } from "@/state/public/schemas";

const BibDownloadButton = dynamic(
  () => import("@/components/classement/BibDownloadButton"),
  { ssr: false },
);
const QrCodeDisplay = dynamic(
  () => import("@/components/classement/QrCodeDisplay"),
  { ssr: false },
);

function formatTime(seconds: number | null | undefined): string {
  if (!seconds) return "-";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m`;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

function formatTimeMinutes(seconds: number | null | undefined): string {
  if (!seconds) return "-";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatPace(seconds: number | null | undefined): string {
  if (!seconds) return "-";
  const paceMin = seconds / 60 / 4; // min/km (4km per tour)
  const m = Math.floor(paceMin);
  const s = Math.round((paceMin - m) * 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface EditionStats {
  finishedCount: number;
  distance: number;
  bestTime: number | null;
  averageTime: number | null;
}

function computeEditionStats(
  participations: PublicParticipation[],
): EditionStats {
  const finished = participations.filter(
    (p) => p.status === "FINISHED" && p.totalTime != null,
  );
  const times = finished
    .map((p) => p.totalTime!)
    .filter((t): t is number => t != null);
  return {
    finishedCount: finished.length,
    distance: finished.length * 4,
    bestTime: times.length > 0 ? Math.min(...times) : null,
    averageTime:
      times.length > 0
        ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
        : null,
  };
}

function deltaText(
  current: number | null,
  other: number | null,
  lowerIsBetter = false,
): { text: string; color: string } | null {
  if (current == null || other == null || other === 0) return null;
  const diff = current - other;
  if (diff === 0) return null;
  const isImprovement = lowerIsBetter ? diff < 0 : diff > 0;
  const pct = Math.round(Math.abs((diff / other) * 100));
  const sign = diff > 0 ? "+" : "";
  return {
    text: lowerIsBetter
      ? `${sign}${Math.round(diff)}s vs autre edition (${isImprovement ? "-" : "+"}${pct}%)`
      : `${sign}${typeof current === "number" && current % 1 === 0 ? diff : diff.toFixed(1)} vs autre edition (${isImprovement ? "+" : "-"}${pct}%)`,
    color: isImprovement ? "green.500" : "red.500",
  };
}

export default function CoureurPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const userId = Number(id);
  const searchParams = useSearchParams();
  const editionParam = searchParams.get("edition");
  const { data: runner, isLoading } = usePublicRunnerQuery(userId);
  const [qrOpen, setQrOpen] = useState(false);

  // Split participations by edition
  const participations2026 = useMemo(() => {
    if (!runner?.participations) return [];
    return runner.participations.filter((p) => p.runEdition === 2026);
  }, [runner?.participations]);

  const participations2025 = useMemo(() => {
    if (!runner?.participations) return [];
    return runner.participations.filter((p) => p.runEdition === 2025);
  }, [runner?.participations]);

  const stats2026 = useMemo(
    () => computeEditionStats(participations2026),
    [participations2026],
  );
  const stats2025 = useMemo(
    () => computeEditionStats(participations2025),
    [participations2025],
  );

  // Build sorted finished participations for chart per edition
  const buildChartData = (participations: PublicParticipation[]) => {
    return [...participations]
      .filter(
        (p): p is PublicParticipation & { totalTime: number } =>
          p.totalTime != null && p.status === "FINISHED",
      )
      .sort((a, b) => {
        const da = a.runStartDate ? new Date(a.runStartDate).getTime() : 0;
        const db = b.runStartDate ? new Date(b.runStartDate).getTime() : 0;
        return da - db;
      })
      .map((p, i) => ({
        name: `T${i + 1}`,
        minutes: Math.round((p.totalTime / 60) * 100) / 100,
        minPerKm: Math.round((p.totalTime / 60 / 4) * 100) / 100,
        label: formatTimeMinutes(p.totalTime),
      }));
  };

  const chartData2026 = useMemo(
    () => buildChartData(participations2026),
    [participations2026],
  );
  const chartData2025 = useMemo(
    () => buildChartData(participations2025),
    [participations2025],
  );

  // Merge chart data for dual line chart (T1..T24 max)
  const mergedChartData = useMemo(() => {
    const maxLen = Math.max(chartData2026.length, chartData2025.length, 0);
    if (maxLen === 0) return [];
    return Array.from({ length: maxLen }, (_, i) => ({
      name: `T${i + 1}`,
      minPerKm2026: chartData2026[i]?.minPerKm ?? null,
      minPerKm2025: chartData2025[i]?.minPerKm ?? null,
    }));
  }, [chartData2026, chartData2025]);

  const defaultTab = editionParam === "2025" ? "2025" : "2026";

  if (isLoading) {
    return (
      <Box minH="100vh" bg="bg.subtle">
        <PublicNav />
        <Box display="flex" justifyContent="center" py="16">
          <Spinner size="xl" color="primary.500" />
        </Box>
      </Box>
    );
  }

  if (!runner) {
    return (
      <Box minH="100vh" bg="bg.subtle">
        <PublicNav />
        <VStack gap="4" py="16" align="center">
          <Text color="fg.muted">Coureur introuvable.</Text>
          <Link href="/classement">
            <Button variant="outline" size="sm">
              <LuArrowLeft /> Retour au classement
            </Button>
          </Link>
        </VStack>
      </Box>
    );
  }

  const fullName =
    `${runner.firstName ?? ""} ${runner.lastName ?? ""}`.trim() || "-";
  const initials =
    (runner.firstName?.charAt(0) ?? "") + (runner.lastName?.charAt(0) ?? "");

  const renderStatCards = (stats: EditionStats, otherStats: EditionStats) => {
    const toursDelta = deltaText(
      stats.finishedCount,
      otherStats.finishedCount,
      false,
    );
    const distanceDelta = deltaText(stats.distance, otherStats.distance, false);
    const bestTimeDelta = deltaText(stats.bestTime, otherStats.bestTime, true);
    const avgTimeDelta = deltaText(
      stats.averageTime,
      otherStats.averageTime,
      true,
    );

    return (
      <SimpleGrid
        columns={{ base: 2, sm: 2, md: 4 }}
        gap={{ base: "3", md: "4" }}
      >
        <Box>
          <StatCard
            label="Tours termines"
            value={stats.finishedCount}
            icon={LuTrophy}
            color="stat.green"
            index={0}
          />
          {toursDelta && (
            <Text fontSize="xs" color={toursDelta.color} mt="1" px="1">
              {toursDelta.text}
            </Text>
          )}
        </Box>
        <Box>
          <StatCard
            label="Distance"
            value={`${stats.distance} km`}
            icon={LuMapPin}
            color="stat.blue"
            index={1}
          />
          {distanceDelta && (
            <Text fontSize="xs" color={distanceDelta.color} mt="1" px="1">
              {distanceDelta.text}
            </Text>
          )}
        </Box>
        <Box>
          <StatCard
            label="Meilleur temps"
            value={formatTime(stats.bestTime)}
            icon={LuTimer}
            color="stat.orange"
            index={2}
          />
          {bestTimeDelta && (
            <Text fontSize="xs" color={bestTimeDelta.color} mt="1" px="1">
              {bestTimeDelta.text}
            </Text>
          )}
        </Box>
        <Box>
          <StatCard
            label="Allure moy."
            value={formatTime(stats.averageTime)}
            icon={LuGauge}
            color="primary.500"
            index={3}
          />
          {avgTimeDelta && (
            <Text fontSize="xs" color={avgTimeDelta.color} mt="1" px="1">
              {avgTimeDelta.text}
            </Text>
          )}
        </Box>
      </SimpleGrid>
    );
  };

  const renderCompareTable = () => (
    <Table.Root size="sm">
      <Table.Header>
        <Table.Row bg="bg.subtle">
          <Table.ColumnHeader px="3" py="2" color="teal.600" textAlign="center">
            2026
          </Table.ColumnHeader>
          <Table.ColumnHeader px="3" py="2" textAlign="center">
            Metrique
          </Table.ColumnHeader>
          <Table.ColumnHeader px="3" py="2" color="gray.500" textAlign="center">
            2025
          </Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <Table.Row>
          <Table.Cell
            px="3"
            py="2"
            textAlign="center"
            color="teal.600"
            fontWeight="bold"
          >
            {stats2026.finishedCount}
          </Table.Cell>
          <Table.Cell px="3" py="2" textAlign="center" fontWeight="semibold">
            Tours
          </Table.Cell>
          <Table.Cell
            px="3"
            py="2"
            textAlign="center"
            color="gray.500"
            fontWeight="bold"
          >
            {stats2025.finishedCount}
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell
            px="3"
            py="2"
            textAlign="center"
            color="teal.600"
            fontWeight="bold"
          >
            {stats2026.distance} km
          </Table.Cell>
          <Table.Cell px="3" py="2" textAlign="center" fontWeight="semibold">
            Distance
          </Table.Cell>
          <Table.Cell
            px="3"
            py="2"
            textAlign="center"
            color="gray.500"
            fontWeight="bold"
          >
            {stats2025.distance} km
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell
            px="3"
            py="2"
            textAlign="center"
            color="teal.600"
            fontWeight="bold"
          >
            {formatTime(stats2026.bestTime)}
          </Table.Cell>
          <Table.Cell px="3" py="2" textAlign="center" fontWeight="semibold">
            Meilleur temps
          </Table.Cell>
          <Table.Cell
            px="3"
            py="2"
            textAlign="center"
            color="gray.500"
            fontWeight="bold"
          >
            {formatTime(stats2025.bestTime)}
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell
            px="3"
            py="2"
            textAlign="center"
            color="teal.600"
            fontWeight="bold"
          >
            {formatTime(stats2026.averageTime)}
          </Table.Cell>
          <Table.Cell px="3" py="2" textAlign="center" fontWeight="semibold">
            Allure moy.
          </Table.Cell>
          <Table.Cell
            px="3"
            py="2"
            textAlign="center"
            color="gray.500"
            fontWeight="bold"
          >
            {formatTime(stats2025.averageTime)}
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table.Root>
  );

  const renderParticipationsDetail = (
    participations: PublicParticipation[],
  ) => {
    if (!participations || participations.length === 0) return null;
    return (
      <Card.Root
        shadow="sm"
        borderWidth="1px"
        borderColor="card.border"
        bg="card.bg"
      >
        <Card.Body p="6">
          <Text
            fontSize="xs"
            color="fg.muted"
            textTransform="uppercase"
            letterSpacing="wider"
            fontWeight="semibold"
            mb="4"
          >
            Detail des tours ({participations.length})
          </Text>

          {/* Desktop table */}
          <Box display={{ base: "none", md: "block" }}>
            <Table.Root size="sm">
              <Table.Header>
                <Table.Row bg="bg.subtle">
                  <Table.ColumnHeader px="3" py="2">
                    #
                  </Table.ColumnHeader>
                  <Table.ColumnHeader px="3" py="2">
                    Debut du run
                  </Table.ColumnHeader>
                  <Table.ColumnHeader px="3" py="2">
                    Arrivee
                  </Table.ColumnHeader>
                  <Table.ColumnHeader px="3" py="2">
                    Temps
                  </Table.ColumnHeader>
                  <Table.ColumnHeader px="3" py="2">
                    Allure (min/km)
                  </Table.ColumnHeader>
                  <Table.ColumnHeader px="3" py="2">
                    Distance
                  </Table.ColumnHeader>
                  <Table.ColumnHeader px="3" py="2">
                    Statut
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {participations.map((p, i) => (
                  <Table.Row key={p.id}>
                    <Table.Cell px="3" py="2" fontWeight="bold" fontSize="sm">
                      {i + 1}
                    </Table.Cell>
                    <Table.Cell px="3" py="2" fontSize="sm">
                      {p.runStartDate
                        ? new Date(p.runStartDate).toLocaleString("fr-FR", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })
                        : "-"}
                    </Table.Cell>
                    <Table.Cell px="3" py="2" fontSize="sm">
                      {p.arrivalTime
                        ? new Date(p.arrivalTime).toLocaleString("fr-FR", {
                            timeStyle: "short",
                          })
                        : "-"}
                    </Table.Cell>
                    <Table.Cell px="3" py="2" fontFamily="mono" fontSize="sm">
                      {formatTime(p.totalTime)}
                    </Table.Cell>
                    <Table.Cell px="3" py="2" fontFamily="mono" fontSize="sm">
                      {formatPace(p.totalTime)} /km
                    </Table.Cell>
                    <Table.Cell px="3" py="2" fontSize="sm">
                      4 km
                    </Table.Cell>
                    <Table.Cell px="3" py="2">
                      {p.status === "FINISHED" ? (
                        <Badge colorPalette="green" size="sm">
                          Termine
                        </Badge>
                      ) : (
                        <Badge colorPalette="orange" size="sm">
                          En cours
                        </Badge>
                      )}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>

          {/* Mobile cards */}
          <VStack
            align="stretch"
            gap="2"
            display={{ base: "flex", md: "none" }}
          >
            {participations.map((p, i) => (
              <HStack
                key={p.id}
                px="4"
                py="3"
                rounded="md"
                bg="bg.subtle"
                justify="space-between"
                flexWrap="wrap"
                gap="2"
              >
                <VStack align="flex-start" gap="0">
                  <Text fontSize="sm" fontWeight="semibold">
                    Tour {i + 1}
                  </Text>
                  <Text fontSize="xs" color="fg.muted">
                    {p.runStartDate
                      ? new Date(p.runStartDate).toLocaleString("fr-FR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })
                      : "-"}
                  </Text>
                  <Text fontSize="xs" color="fg.muted">
                    4 km
                  </Text>
                </VStack>
                <VStack align="flex-end" gap="0">
                  <HStack gap="3">
                    <Text fontFamily="mono" fontSize="sm" fontWeight="medium">
                      {formatTime(p.totalTime)}
                    </Text>
                    {p.status === "FINISHED" ? (
                      <Badge colorPalette="green" size="sm">
                        Termine
                      </Badge>
                    ) : (
                      <Badge colorPalette="orange" size="sm">
                        En cours
                      </Badge>
                    )}
                  </HStack>
                  {p.totalTime && (
                    <Text fontSize="xs" color="fg.muted" fontFamily="mono">
                      {formatPace(p.totalTime)} /km
                    </Text>
                  )}
                </VStack>
              </HStack>
            ))}
          </VStack>
        </Card.Body>
      </Card.Root>
    );
  };

  return (
    <Box minH="100vh" bg="bg.subtle">
      <PublicNav />

      <Box maxW="4xl" mx="auto" px="4" py="8">
        <VStack align="stretch" gap="6">
          {/* Back link */}
          <HStack>
            <Link href="/classement">
              <Button variant="ghost" size="sm" colorPalette="primary">
                <LuArrowLeft /> Classement
              </Button>
            </Link>
          </HStack>

          {/* Hero card */}
          <Card.Root
            shadow="sm"
            borderWidth="1px"
            borderColor="card.border"
            bg="card.bg"
          >
            <Card.Body p={{ base: "4", md: "6" }}>
              <HStack gap={{ base: "3", md: "5" }} align="flex-start">
                <Avatar.Root
                  size={{ base: "lg", md: "xl" }}
                  colorPalette="primary"
                >
                  <Avatar.Fallback>{initials}</Avatar.Fallback>
                </Avatar.Root>

                <VStack align="flex-start" gap="1" flex="1" minW="0">
                  <Heading
                    size={{ base: "lg", md: "xl" }}
                    fontWeight="extrabold"
                    truncate
                  >
                    {fullName}
                  </Heading>
                  {runner.surname && (
                    <Text color="fg.muted" fontSize="sm" truncate>
                      {runner.surname}
                    </Text>
                  )}
                  {runner.organization && (
                    <Badge colorPalette="gray" size="sm">
                      {runner.organization}
                    </Badge>
                  )}
                  <Text fontSize="xs" color="fg.muted" fontFamily="mono" mt="1">
                    Dossard #{runner.id}
                  </Text>
                </VStack>
              </HStack>

              {/* Action buttons */}
              <HStack gap="2" mt="4" flexWrap="wrap">
                {runner.id && (
                  <QrCodeDisplay
                    userId={runner.id}
                    open={qrOpen}
                    onOpenChange={setQrOpen}
                  />
                )}
                {runner.id && runner.firstName && runner.lastName && (
                  <BibDownloadButton
                    user={{
                      id: runner.id,
                      firstName: runner.firstName,
                      lastName: runner.lastName,
                      surname: runner.surname,
                    }}
                  />
                )}
              </HStack>
            </Card.Body>
          </Card.Root>

          {/* Edition tabs */}
          <Tabs.Root defaultValue={defaultTab}>
            <Tabs.List>
              <Tabs.Trigger value="2026">2026</Tabs.Trigger>
              <Tabs.Trigger value="2025">2025</Tabs.Trigger>
              <Tabs.Trigger value="compare">
                <LuScale size={14} />
                <Text ml="1">Comparer</Text>
              </Tabs.Trigger>
            </Tabs.List>

            {/* 2026 tab */}
            <Tabs.Content value="2026">
              <VStack align="stretch" gap="6" mt="4">
                {renderStatCards(stats2026, stats2025)}
                {renderParticipationsDetail(participations2026)}
              </VStack>
            </Tabs.Content>

            {/* 2025 tab */}
            <Tabs.Content value="2025">
              <VStack align="stretch" gap="6" mt="4">
                {renderStatCards(stats2025, stats2026)}
                {renderParticipationsDetail(participations2025)}
              </VStack>
            </Tabs.Content>

            {/* Compare tab */}
            <Tabs.Content value="compare">
              <VStack align="stretch" gap="6" mt="4">
                <Card.Root
                  shadow="sm"
                  borderWidth="1px"
                  borderColor="card.border"
                  bg="card.bg"
                >
                  <Card.Body p={{ base: "3", md: "6" }}>
                    <Text
                      fontSize="xs"
                      color="fg.muted"
                      textTransform="uppercase"
                      letterSpacing="wider"
                      fontWeight="semibold"
                      mb="4"
                    >
                      Comparaison des editions
                    </Text>
                    {renderCompareTable()}
                  </Card.Body>
                </Card.Root>
              </VStack>
            </Tabs.Content>
          </Tabs.Root>

          {/* Dual pace chart */}
          {mergedChartData.length >= 2 && (
            <Card.Root
              shadow="sm"
              borderWidth="1px"
              borderColor="card.border"
              bg="card.bg"
            >
              <Card.Body p={{ base: "3", md: "6" }}>
                <HStack mb="3" gap="2" align="center">
                  <LuActivity size={16} />
                  <Text
                    fontSize="xs"
                    color="fg.muted"
                    textTransform="uppercase"
                    letterSpacing="wider"
                    fontWeight="semibold"
                  >
                    Allure par tour (min/km)
                  </Text>
                </HStack>

                {/* Legend */}
                <HStack gap="4" mb="3">
                  <HStack gap="1">
                    <Box w="3" h="3" bg="#0f929a" rounded="sm" />
                    <Text fontSize="xs" color="fg.muted">
                      2026
                    </Text>
                  </HStack>
                  <HStack gap="1">
                    <Box w="3" h="3" bg="#94a3b8" rounded="sm" />
                    <Text fontSize="xs" color="fg.muted">
                      2025
                    </Text>
                  </HStack>
                </HStack>

                <Box h="250px" overflowX="auto" overflowY="hidden">
                  <Box
                    minW={{
                      base: `${Math.max(mergedChartData.length * 60, 300)}px`,
                      md: "100%",
                    }}
                    h="100%"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={mergedChartData}
                        margin={{ left: -10, right: 10, top: 5, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis
                          dataKey="name"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v: number) =>
                            `${Math.floor(v)}:${String(Math.round((v % 1) * 60)).padStart(2, "0")}`
                          }
                        />
                        <Tooltip
                          formatter={(value, name) => {
                            const v = Number(value);
                            const label =
                              name === "minPerKm2026" ? "2026" : "2025";
                            return [
                              `${Math.floor(v)}:${String(Math.round((v % 1) * 60)).padStart(2, "0")} min/km`,
                              label,
                            ];
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="minPerKm2026"
                          stroke="#0f929a"
                          strokeWidth={2}
                          dot={{ fill: "#0f929a", r: 4 }}
                          activeDot={{ r: 6 }}
                          connectNulls={false}
                          name="minPerKm2026"
                        />
                        <Line
                          type="monotone"
                          dataKey="minPerKm2025"
                          stroke="#94a3b8"
                          strokeWidth={1.5}
                          strokeDasharray="4 2"
                          dot={{ fill: "#94a3b8", r: 3 }}
                          activeDot={{ r: 5 }}
                          connectNulls={false}
                          name="minPerKm2025"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Box>
              </Card.Body>
            </Card.Root>
          )}
        </VStack>
      </Box>
    </Box>
  );
}
