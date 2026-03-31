"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  Card,
  Heading,
  HStack,
  Input,
  SimpleGrid,
  Skeleton,
  Table,
  Text,
  VStack,
} from "@chakra-ui/react";
import { LuSearch, LuTrophy, LuMapPin, LuTimer } from "react-icons/lu";
import { PublicNav } from "@/components/public/PublicNav";
import { StatCard } from "@/components/admin/ui/StatCard";
import {
  usePublicRunnersQuery,
  type PublicRunner,
} from "@/state/public/queries";

function formatTime(seconds: number | null | undefined): string {
  if (!seconds) return "-";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m`;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

export default function ClassementPage() {
  const [search, setSearch] = useState("");
  const { data: runners, isLoading } = usePublicRunnersQuery();

  // Client-side ranking: finishedParticipationsCount desc, then totalTime asc
  const ranked = useMemo(() => {
    if (!runners) return [];
    return [...runners]
      .sort((a, b) => {
        const aRuns = a.finishedParticipationsCount ?? 0;
        const bRuns = b.finishedParticipationsCount ?? 0;
        if (bRuns !== aRuns) return bRuns - aRuns;
        return (a.totalTime ?? Infinity) - (b.totalTime ?? Infinity);
      })
      .map((r, i) => ({ ...r, rank: i + 1 }));
  }, [runners]);

  // Client-side search filter
  const filtered = useMemo(() => {
    if (!search.trim()) return ranked;
    const q = search.toLowerCase();
    return ranked.filter(
      (r) =>
        r.firstName?.toLowerCase().includes(q) ||
        r.lastName?.toLowerCase().includes(q) ||
        r.surname?.toLowerCase().includes(q) ||
        String(r.id).includes(q),
    );
  }, [ranked, search]);

  // Global stats
  const totalKm = ranked.reduce(
    (s, r) => s + (r.finishedParticipationsCount ?? 0) * 4,
    0,
  );
  const totalRuns = ranked.reduce(
    (s, r) => s + (r.finishedParticipationsCount ?? 0),
    0,
  );
  const totalRunners = ranked.length;

  return (
    <Box minH="100vh" bg="bg.subtle">
      <PublicNav />

      <Box maxW="6xl" mx="auto" px="4" py="8">
        <VStack align="stretch" gap="6">
          <Heading size="2xl" fontWeight="extrabold" letterSpacing="tight">
            Classement
          </Heading>

          {/* Global stats */}
          <SimpleGrid columns={{ base: 1, sm: 3 }} gap="4">
            <StatCard
              label="Coureurs"
              value={totalRunners}
              icon={LuTrophy}
              color="primary.500"
              loading={isLoading}
              index={0}
            />
            <StatCard
              label="Tours effectues"
              value={totalRuns}
              icon={LuTimer}
              color="stat.blue"
              loading={isLoading}
              index={1}
            />
            <StatCard
              label="Km parcourus"
              value={`${totalKm} km`}
              icon={LuMapPin}
              color="stat.green"
              loading={isLoading}
              index={2}
            />
          </SimpleGrid>

          {/* Search */}
          <HStack gap="3">
            <Box position="relative" flex="1">
              <Input
                placeholder="Rechercher un coureur..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="lg"
                pl="10"
              />
              <Box
                position="absolute"
                left="3"
                top="50%"
                transform="translateY(-50%)"
                color="fg.muted"
              >
                <LuSearch />
              </Box>
            </Box>
          </HStack>

          {/* Results table */}
          <Card.Root
            shadow="sm"
            borderWidth="1px"
            borderColor="card.border"
            bg="card.bg"
          >
            <Box overflowX="auto">
              <Table.Root size="sm">
                <Table.Header>
                  <Table.Row bg="bg.subtle">
                    <Table.ColumnHeader px="4" py="3" w="60px">
                      #
                    </Table.ColumnHeader>
                    <Table.ColumnHeader px="4" py="3">
                      Coureur
                    </Table.ColumnHeader>
                    <Table.ColumnHeader px="4" py="3" w="80px">
                      Dossard
                    </Table.ColumnHeader>
                    <Table.ColumnHeader px="4" py="3" w="100px">
                      Tours
                    </Table.ColumnHeader>
                    <Table.ColumnHeader px="4" py="3" w="100px">
                      Distance
                    </Table.ColumnHeader>
                    <Table.ColumnHeader px="4" py="3" w="120px">
                      Temps total
                    </Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {isLoading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <Table.Row key={i}>
                        {Array.from({ length: 6 }).map((_, j) => (
                          <Table.Cell key={j} px="4" py="3">
                            <Skeleton height="4" width={`${50 + j * 10}%`} />
                          </Table.Cell>
                        ))}
                      </Table.Row>
                    ))
                  ) : filtered.length === 0 ? (
                    <Table.Row>
                      <Table.Cell colSpan={6} textAlign="center" py="8">
                        <Text color="fg.muted">Aucun coureur trouve</Text>
                      </Table.Cell>
                    </Table.Row>
                  ) : (
                    filtered.map((r) => {
                      const name =
                        `${r.firstName ?? ""} ${r.lastName ?? ""}`.trim() ||
                        "-";
                      const tours = r.finishedParticipationsCount ?? 0;
                      return (
                        <Table.Row
                          key={r.id}
                          _hover={{ bg: "bg.subtle" }}
                          transition="background 0.1s"
                        >
                          <Table.Cell px="4" py="3" fontWeight="bold">
                            {r.rank}
                          </Table.Cell>
                          <Table.Cell px="4" py="3">
                            <Link
                              href={`/coureurs/${r.id}`}
                              style={{ textDecoration: "none" }}
                            >
                              <Text
                                fontWeight="medium"
                                color="primary.fg"
                                _hover={{ textDecoration: "underline" }}
                                fontSize="sm"
                              >
                                {name}
                                {r.surname && (
                                  <Text
                                    as="span"
                                    color="fg.muted"
                                    fontWeight="normal"
                                    ml="1"
                                  >
                                    ({r.surname})
                                  </Text>
                                )}
                              </Text>
                            </Link>
                            {r.organization && (
                              <Text fontSize="xs" color="fg.muted">
                                {r.organization}
                              </Text>
                            )}
                          </Table.Cell>
                          <Table.Cell
                            px="4"
                            py="3"
                            fontFamily="mono"
                            fontSize="sm"
                          >
                            #{r.id}
                          </Table.Cell>
                          <Table.Cell
                            px="4"
                            py="3"
                            fontVariantNumeric="tabular-nums"
                          >
                            {tours}
                          </Table.Cell>
                          <Table.Cell
                            px="4"
                            py="3"
                            fontVariantNumeric="tabular-nums"
                          >
                            {tours * 4} km
                          </Table.Cell>
                          <Table.Cell
                            px="4"
                            py="3"
                            fontFamily="mono"
                            fontSize="sm"
                          >
                            {formatTime(r.totalTime)}
                          </Table.Cell>
                        </Table.Row>
                      );
                    })
                  )}
                </Table.Body>
              </Table.Root>
            </Box>
          </Card.Root>
        </VStack>
      </Box>
    </Box>
  );
}
