"use client";

import { use } from "react";
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
  Skeleton,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  LuArrowLeft,
  LuTrophy,
  LuMapPin,
  LuTimer,
  LuGauge,
} from "react-icons/lu";
import { PublicNav } from "@/components/public/PublicNav";
import { StatCard } from "@/components/admin/ui/StatCard";
import { usePublicRunnerQuery } from "@/state/public/queries";

const BibDownloadButton = dynamic(
  () => import("@/components/classement/BibDownloadButton"),
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

export default function CoureurPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const userId = Number(id);
  const { data: runner, isLoading } = usePublicRunnerQuery(userId);

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
            <Card.Body p="6">
              <HStack gap="5" align="flex-start" flexWrap="wrap">
                <Avatar.Root size="xl" colorPalette="primary">
                  <Avatar.Fallback>{initials}</Avatar.Fallback>
                </Avatar.Root>

                <VStack align="flex-start" gap="1" flex="1">
                  <Heading size="xl" fontWeight="extrabold">
                    {fullName}
                  </Heading>
                  {runner.surname && (
                    <Text color="fg.muted" fontSize="sm">
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
          <SimpleGrid columns={{ base: 2, md: 4 }} gap="4">
            <StatCard
              label="Tours termines"
              value={finishedRuns}
              icon={LuTrophy}
              color="stat.green"
            />
            <StatCard
              label="Distance"
              value={`${distance} km`}
              icon={LuMapPin}
              color="stat.blue"
            />
            <StatCard
              label="Meilleur temps"
              value={formatTime(runner.bestTime)}
              icon={LuTimer}
              color="stat.orange"
            />
            <StatCard
              label="Allure moyenne"
              value={formatTime(runner.averageTime)}
              icon={LuGauge}
              color="primary.500"
            />
          </SimpleGrid>

          {/* Participation count info */}
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
                  Participations ({runner.participations.length})
                </Text>
                <VStack align="stretch" gap="2">
                  {runner.participations.map((partId, i) => (
                    <HStack
                      key={partId}
                      px="4"
                      py="3"
                      rounded="md"
                      bg="bg.subtle"
                      justify="space-between"
                    >
                      <HStack gap="3">
                        <Box
                          w="3"
                          h="3"
                          rounded="full"
                          bg="primary.500"
                          flexShrink={0}
                        />
                        <Text fontSize="sm" fontWeight="medium">
                          Tour {i + 1}
                        </Text>
                      </HStack>
                      <Text fontSize="xs" color="fg.muted" fontFamily="mono">
                        #{partId}
                      </Text>
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
