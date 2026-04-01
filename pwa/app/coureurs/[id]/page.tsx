"use client";

import { use, useMemo, useState } from "react";
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

export default function CoureurPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const userId = Number(id);
  const { data: runner, isLoading } = usePublicRunnerQuery(userId);
  const [qrOpen, setQrOpen] = useState(false);

  // Sort participations by run start date for the chart
  const sortedParticipations = useMemo(() => {
    if (!runner?.participations) return [];
    return [...runner.participations]
      .filter(
        (p): p is PublicParticipation & { totalTime: number } =>
          p.totalTime != null && p.status === "FINISHED",
      )
      .sort((a, b) => {
        const da = a.runStartDate ? new Date(a.runStartDate).getTime() : 0;
        const db = b.runStartDate ? new Date(b.runStartDate).getTime() : 0;
        return da - db;
      });
  }, [runner?.participations]);

  // Chart data: pace per run in min/km (4km per tour)
  const chartData = useMemo(() => {
    return sortedParticipations.map((p, i) => ({
      name: `Tour ${i + 1}`,
      minutes: Math.round((p.totalTime / 60) * 100) / 100,
      minPerKm: Math.round((p.totalTime / 60 / 4) * 100) / 100,
      label: formatTimeMinutes(p.totalTime),
    }));
  }, [sortedParticipations]);

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
  const finishedRuns = runner.finishedParticipationsCount ?? 0;
  const distance = finishedRuns * 4;
  const initials =
    (runner.firstName?.charAt(0) ?? "") + (runner.lastName?.charAt(0) ?? "");

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

              {/* Action buttons — always horizontal */}
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

          {/* Stats grid */}
          <SimpleGrid
            columns={{ base: 2, sm: 2, md: 4 }}
            gap={{ base: "3", md: "4" }}
          >
            <StatCard
              label="Tours terminés"
              value={finishedRuns}
              icon={LuTrophy}
              color="stat.green"
              index={0}
            />
            <StatCard
              label="Distance"
              value={`${distance} km`}
              icon={LuMapPin}
              color="stat.blue"
              index={1}
            />
            <StatCard
              label="Meilleur temps"
              value={formatTime(runner.bestTime)}
              icon={LuTimer}
              color="stat.orange"
              index={2}
            />
            <StatCard
              label="Allure moy."
              value={formatTime(runner.averageTime)}
              icon={LuGauge}
              color="primary.500"
              index={3}
            />
          </SimpleGrid>

          {/* Pace chart */}
          {chartData.length >= 2 && (
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
                <Box h="250px" overflowX="auto" overflowY="hidden">
                  <Box
                    minW={{
                      base: `${Math.max(chartData.length * 60, 300)}px`,
                      md: "100%",
                    }}
                    h="100%"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData}
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
                          formatter={(value) => {
                            const v = Number(value);
                            return [
                              `${Math.floor(v)}:${String(Math.round((v % 1) * 60)).padStart(2, "0")} min/km`,
                              "Allure",
                            ];
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="minPerKm"
                          stroke="#0f929a"
                          strokeWidth={2}
                          dot={{ fill: "#0f929a", r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Box>
              </Card.Body>
            </Card.Root>
          )}

          {/* Participations detail table */}
          {runner.participations && runner.participations.length > 0 && (
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
                  Détail des tours ({runner.participations.length})
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
                          Début du run
                        </Table.ColumnHeader>
                        <Table.ColumnHeader px="3" py="2">
                          Arrivée
                        </Table.ColumnHeader>
                        <Table.ColumnHeader px="3" py="2">
                          Temps
                        </Table.ColumnHeader>
                        <Table.ColumnHeader px="3" py="2">
                          Allure (min/km)
                        </Table.ColumnHeader>
                        <Table.ColumnHeader px="3" py="2">
                          Statut
                        </Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {runner.participations.map((p, i) => (
                        <Table.Row key={p.id}>
                          <Table.Cell
                            px="3"
                            py="2"
                            fontWeight="bold"
                            fontSize="sm"
                          >
                            {i + 1}
                          </Table.Cell>
                          <Table.Cell px="3" py="2" fontSize="sm">
                            {p.runStartDate
                              ? new Date(p.runStartDate).toLocaleString(
                                  "fr-FR",
                                  {
                                    dateStyle: "short",
                                    timeStyle: "short",
                                  },
                                )
                              : "-"}
                          </Table.Cell>
                          <Table.Cell px="3" py="2" fontSize="sm">
                            {p.arrivalTime
                              ? new Date(p.arrivalTime).toLocaleString(
                                  "fr-FR",
                                  { timeStyle: "short" },
                                )
                              : "-"}
                          </Table.Cell>
                          <Table.Cell
                            px="3"
                            py="2"
                            fontFamily="mono"
                            fontSize="sm"
                          >
                            {formatTime(p.totalTime)}
                          </Table.Cell>
                          <Table.Cell
                            px="3"
                            py="2"
                            fontFamily="mono"
                            fontSize="sm"
                          >
                            {formatPace(p.totalTime)} /km
                          </Table.Cell>
                          <Table.Cell px="3" py="2">
                            {p.status === "FINISHED" ? (
                              <Badge colorPalette="green" size="sm">
                                Terminé
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
                  {runner.participations.map((p, i) => (
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
                      </VStack>
                      <VStack align="flex-end" gap="0">
                        <HStack gap="3">
                          <Text
                            fontFamily="mono"
                            fontSize="sm"
                            fontWeight="medium"
                          >
                            {formatTime(p.totalTime)}
                          </Text>
                          {p.status === "FINISHED" ? (
                            <Badge colorPalette="green" size="sm">
                              Terminé
                            </Badge>
                          ) : (
                            <Badge colorPalette="orange" size="sm">
                              En cours
                            </Badge>
                          )}
                        </HStack>
                        {p.totalTime && (
                          <Text
                            fontSize="xs"
                            color="fg.muted"
                            fontFamily="mono"
                          >
                            {formatPace(p.totalTime)} /km
                          </Text>
                        )}
                      </VStack>
                    </HStack>
                  ))}
                </VStack>
              </Card.Body>
            </Card.Root>
          )}
        </VStack>
      </Box>
    </Box>
  );
}
