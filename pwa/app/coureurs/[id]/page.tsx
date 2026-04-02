"use client";

export const dynamic = "force-dynamic";

import { Suspense, use, useState } from "react";
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
  Skeleton,
  Tabs,
  Text,
  VStack,
} from "@chakra-ui/react";
import { LuArrowLeft, LuActivity } from "react-icons/lu";
import { PublicNav } from "@/components/public/PublicNav";
import { RunnerStatCards } from "@/components/public/RunnerStatCards";
import { EditionCompareTable } from "@/components/public/EditionCompareTable";
import { PaceChart } from "@/components/public/PaceChart";
import { ParticipationsDetail } from "@/components/public/ParticipationsDetail";
import { usePublicRunnerQuery } from "@/state/public/queries";
import { useRunnerStats } from "@/hooks/useRunnerStats";
import type { EditionStats, PublicParticipation } from "@/state/public/schemas";
const BibDownloadButton = dynamic(
  () => import("@/components/classement/BibDownloadButton"),
  { ssr: false },
);
const QrCodeDisplay = dynamic(
  () => import("@/components/classement/QrCodeDisplay"),
  { ssr: false },
);

type ChartPoint = {
  name: string;
  pace2026: number | null;
  pace2025: number | null;
};

function TabContent({
  stats,
  prevStats,
  participations,
  edition,
  chartData,
}: {
  stats: EditionStats;
  prevStats: EditionStats;
  participations: PublicParticipation[];
  edition: number;
  chartData: ChartPoint[];
}) {
  return (
    <VStack align="stretch" gap="4" mt="4">
      <RunnerStatCards stats={stats} prevStats={prevStats} />
      {chartData.length >= 2 && (
        <Card.Root
          shadow="sm"
          borderWidth="1px"
          borderColor="card.border"
          bg="card.bg"
        >
          <Card.Body p={{ base: "3", md: "4" }}>
            <HStack mb="2" gap="2" align="center">
              <LuActivity size={14} />
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
            <PaceChart data={chartData} />
          </Card.Body>
        </Card.Root>
      )}
      <ParticipationsDetail participations={participations} edition={edition} />
    </VStack>
  );
}

function CoureurContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const userId = Number(id);
  const searchParams = useSearchParams();
  const editionParam = searchParams.get("edition");
  const { data: runner, isLoading } = usePublicRunnerQuery(userId);
  const [qrOpen, setQrOpen] = useState(false);

  const {
    stats2026,
    stats2025,
    participations2026,
    participations2025,
    chartData,
  } = useRunnerStats(runner);

  const defaultTab = editionParam === "2025" ? "2025" : "2026";

  if (isLoading) {
    return (
      <Box minH="100vh" bg="bg.subtle">
        <PublicNav />
        <Box maxW="4xl" mx="auto" px="4" py="8">
          <VStack align="stretch" gap="6">
            <Skeleton height="8" width="32" rounded="md" />
            <Card.Root
              shadow="sm"
              borderWidth="1px"
              borderColor="card.border"
              bg="card.bg"
            >
              <Card.Body p={{ base: "4", md: "6" }}>
                <HStack gap="4">
                  <Skeleton boxSize={{ base: "12", md: "16" }} rounded="full" />
                  <VStack align="flex-start" gap="2" flex="1">
                    <Skeleton height="6" width="48" rounded="md" />
                    <Skeleton height="4" width="32" rounded="md" />
                  </VStack>
                </HStack>
              </Card.Body>
            </Card.Root>
            <VStack align="stretch" gap="4">
              <HStack gap="2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} height="9" flex="1" rounded="md" />
                ))}
              </HStack>
              <HStack gap="4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} height="24" flex="1" rounded="xl" />
                ))}
              </HStack>
              <Skeleton height="32" rounded="xl" />
              <Skeleton height="40" rounded="xl" />
            </VStack>
          </VStack>
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
                  {runner.image && (
                    <Avatar.Image src={runner.image} alt={initials} />
                  )}
                  <Avatar.Fallback>{initials}</Avatar.Fallback>
                </Avatar.Root>

                <VStack
                  align="flex-start"
                  gap="1"
                  flex="1"
                  minW="0"
                  overflow="hidden"
                  w="full"
                >
                  <Heading
                    size={{ base: "lg", md: "xl" }}
                    fontWeight="extrabold"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    whiteSpace="nowrap"
                    w="full"
                  >
                    {fullName}
                  </Heading>
                  {runner.surname && (
                    <Text color="fg.muted" fontSize="sm" truncate w="full">
                      {runner.surname}
                    </Text>
                  )}
                  {runner.organization && (
                    <Badge
                      colorPalette="gray"
                      size="sm"
                      maxW="full"
                      overflow="hidden"
                      textOverflow="ellipsis"
                      whiteSpace="nowrap"
                      display="block"
                    >
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
              <Tabs.Trigger value="2026">
                2026
                <Badge colorPalette="teal" size="xs" ml="1" variant="subtle">
                  en cours
                </Badge>
              </Tabs.Trigger>
              <Tabs.Trigger value="2025">2025</Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="2026">
              <TabContent
                stats={stats2026}
                prevStats={stats2025}
                participations={participations2026}
                edition={2026}
                chartData={chartData}
              />
            </Tabs.Content>

            <Tabs.Content value="2025">
              <TabContent
                stats={stats2025}
                prevStats={stats2026}
                participations={participations2025}
                edition={2025}
                chartData={chartData}
              />
            </Tabs.Content>
          </Tabs.Root>

          {/* Comparison — always visible */}
          <Card.Root
            shadow="sm"
            borderWidth="1px"
            borderColor="card.border"
            bg="card.bg"
          >
            <Card.Body p={{ base: "3", md: "5" }}>
              <Text
                fontSize="xs"
                color="fg.muted"
                textTransform="uppercase"
                letterSpacing="wider"
                fontWeight="semibold"
                mb="4"
              >
                Comparaison 2026 vs 2025
              </Text>
              <EditionCompareTable
                stats2026={stats2026}
                stats2025={stats2025}
              />
            </Card.Body>
          </Card.Root>
        </VStack>
      </Box>
    </Box>
  );
}

export default function CoureurPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense>
      <CoureurContent params={params} />
    </Suspense>
  );
}
