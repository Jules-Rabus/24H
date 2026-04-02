"use client";

import { Suspense, useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Heading,
  HStack,
  Input,
  SimpleGrid,
  Skeleton,
  Text,
  VStack,
} from "@chakra-ui/react";
import { LuSearch, LuStar, LuChevronRight } from "react-icons/lu";
import { PublicNav } from "@/components/public/PublicNav";
import { usePublicRunnersQuery } from "@/state/public/queries";
import { type RankedRunner } from "@/state/public/schemas";
import { useFavorites } from "@/hooks/useFavorites";
import { formatPace } from "@/utils/race";

const RANK_MEDALS = ["🥇", "🥈", "🥉"] as const;

function ClassementContent() {
  const searchParams = useSearchParams();
  const edition = Number(searchParams.get("edition")) || 2026;

  const [search, setSearch] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);
  const { data: runners, isLoading } = usePublicRunnersQuery(edition);
  const { data: prevRunners } = usePublicRunnersQuery(edition - 1);
  const { favorites, toggle, isFavorite } = useFavorites();

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

  const filtered = useMemo(() => {
    let list = ranked;
    if (showFavorites) {
      list = list.filter((r) => r.id && isFavorite(r.id));
    }
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (r) =>
        r.firstName?.toLowerCase().includes(q) ||
        r.lastName?.toLowerCase().includes(q) ||
        r.surname?.toLowerCase().includes(q) ||
        String(r.id).includes(q),
    );
  }, [ranked, search, showFavorites, isFavorite]);

  const totalRunners = ranked.length;
  const totalRuns = ranked.reduce(
    (s, r) => s + (r.finishedParticipationsCount ?? 0),
    0,
  );
  const totalKm = totalRuns * 4;

  const prevTotalRunners = prevRunners?.length ?? 0;
  const prevTotalRuns =
    prevRunners?.reduce(
      (s, r) => s + (r.finishedParticipationsCount ?? 0),
      0,
    ) ?? 0;
  const prevTotalKm = prevTotalRuns * 4;

  const favCount = ranked.filter((r) => r.id && isFavorite(r.id)).length;

  return (
    <Box minH="100vh" bg="bg.subtle">
      <PublicNav />

      <Box maxW="6xl" mx="auto" px="4" py="8">
        <VStack align="stretch" gap="6">
          <Heading size="2xl" fontWeight="extrabold" letterSpacing="tight">
            Classement
          </Heading>

          <SimpleGrid columns={3} gap="3">
            {[
              { label: "Coureurs", value: totalRunners, color: "primary.500", delta: totalRunners - prevTotalRunners },
              { label: "Tours", value: totalRuns, color: "blue.500", delta: totalRuns - prevTotalRuns },
              { label: "Distance", value: `${totalKm}km`, color: "green.500", delta: totalKm - prevTotalKm },
            ].map(({ label, value, color, delta }) => (
              <Card.Root key={label} shadow="sm" borderWidth="1px" borderColor="card.border" bg="card.bg">
                <Card.Body p="3" textAlign="center">
                  <Skeleton loading={isLoading} height="6" mx="auto" width="12">
                    <Text fontWeight="extrabold" fontSize="xl" color={color} lineHeight="1">
                      {value}
                    </Text>
                  </Skeleton>
                  <Text color="fg.muted" fontSize="2xs" mt="1" lineHeight="1">{label}</Text>
                  {prevRunners && prevRunners.length > 0 && (
                    <Text
                      fontSize="2xs"
                      mt="1"
                      lineHeight="1"
                      color={delta >= 0 ? "green.500" : "red.500"}
                      fontWeight="semibold"
                    >
                      {delta >= 0 ? "+" : ""}{delta} vs {edition - 1}
                    </Text>
                  )}
                </Card.Body>
              </Card.Root>
            ))}
          </SimpleGrid>

          <HStack gap="3">
            <Box position="relative" flex="1">
              <Input
                placeholder="Nom, prénom, surnom ou n° dossard"
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

          <HStack bg="bg" rounded="md" p="1" gap="1">
            <Button
              flex="1"
              size="sm"
              variant={!showFavorites ? "solid" : "ghost"}
              colorPalette={!showFavorites ? "primary" : undefined}
              onClick={() => setShowFavorites(false)}
            >
              Tous
            </Button>
            <Button
              flex="1"
              size="sm"
              variant={showFavorites ? "solid" : "ghost"}
              colorPalette={showFavorites ? "primary" : undefined}
              onClick={() => setShowFavorites(true)}
            >
              <LuStar /> Mes favoris
              {favCount > 0 && (
                <Badge colorPalette="gray" size="sm" ml="1" variant="subtle">
                  {favCount}
                </Badge>
              )}
            </Button>
          </HStack>

          <Card.Root
            shadow="sm"
            borderWidth="1px"
            borderColor="card.border"
            bg="card.bg"
          >
            <Card.Body p="0">
              {isLoading ? (
                <VStack gap="0" p="3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} height="14" width="100%" rounded="md" />
                  ))}
                </VStack>
              ) : filtered.length === 0 ? (
                <Box textAlign="center" py="8">
                  <Text color="fg.muted">Aucun coureur trouvé</Text>
                </Box>
              ) : (
                <VStack gap="0" align="stretch">
                  {filtered.map((r) => (
                    <RunnerRow
                      key={r.id}
                      runner={r}
                      isFav={!!r.id && isFavorite(r.id)}
                      onToggleFav={() => r.id && toggle(r.id)}
                    />
                  ))}
                </VStack>
              )}
            </Card.Body>
          </Card.Root>
        </VStack>
      </Box>
    </Box>
  );
}

export default function ClassementPage() {
  return (
    <Suspense>
      <ClassementContent />
    </Suspense>
  );
}

function RunnerRow({
  runner,
  isFav,
  onToggleFav,
}: {
  runner: RankedRunner;
  isFav: boolean;
  onToggleFav: () => void;
}) {
  const name =
    `${runner.firstName ?? ""} ${runner.lastName ?? ""}`.trim() || "-";
  const tours = runner.finishedParticipationsCount ?? 0;
  const km = tours * 4;
  const initials =
    (runner.firstName?.charAt(0) ?? "") + (runner.lastName?.charAt(0) ?? "");
  const medal = runner.rank <= 3 ? RANK_MEDALS[runner.rank - 1] : undefined;

  return (
    <Link href={`/coureurs/${runner.id}`} style={{ textDecoration: "none" }}>
      <HStack
        px="3"
        py="3"
        gap="2"
        borderBottom="1px solid"
        borderColor="border.subtle"
        bg={isFav ? { base: "yellow.50", _dark: "yellow.950" } : undefined}
        _hover={{ bg: isFav ? { base: "yellow.100", _dark: "yellow.900" } : "bg.muted" }}
        transition="background 0.1s"
        cursor="pointer"
      >
        <Text
          fontWeight="bold"
          fontSize={medal ? "lg" : "sm"}
          w="7"
          textAlign="center"
          flexShrink={0}
          color={medal ? undefined : "fg.muted"}
        >
          {medal ?? runner.rank}
        </Text>

        <Avatar.Root size="sm" colorPalette="primary" flexShrink={0}>
          {runner.image ? (
            <Avatar.Image src={runner.image} alt={initials} />
          ) : null}
          <Avatar.Fallback>{initials}</Avatar.Fallback>
        </Avatar.Root>

        <Box flex="1" minW="0" overflow="hidden">
          <Text fontWeight="medium" fontSize="sm" truncate w="full">
            {name}
          </Text>
          <HStack gap="1" fontSize="xs" color="fg.muted" overflow="hidden">
            <Text fontFamily="mono" flexShrink={0}>#{runner.id}</Text>
            {runner.organization && (
              <Text truncate overflow="hidden" minW="0">· {runner.organization}</Text>
            )}
          </HStack>
        </Box>

        <VStack align="flex-end" gap="0" flexShrink={0}>
          <Badge colorPalette="primary" size="sm">
            {tours} tour{tours !== 1 ? "s" : ""}
          </Badge>
          <HStack gap="2" fontSize="xs" color="fg.muted" fontFamily="mono">
            <Text>{km} km</Text>
            <Text>{formatPace(runner.averageTime)}</Text>
          </HStack>
        </VStack>

        <Button
          variant="ghost"
          size="xs"
          aria-label="Toggle favori"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleFav();
          }}
          color={isFav ? "yellow.500" : "fg.subtle"}
          flexShrink={0}
        >
          <LuStar fill={isFav ? "currentColor" : "none"} />
        </Button>

        <Box color={isFav ? "primary.fg" : "fg.subtle"} flexShrink={0}>
          <LuChevronRight size={16} />
        </Box>
      </HStack>
    </Link>
  );
}
