"use client";

import { useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  HStack,
  Table,
  Text,
  VStack,
} from "@chakra-ui/react";
import { LuChevronDown, LuChevronUp } from "react-icons/lu";
import { formatTime, formatPace } from "@/utils/race";
import type { PublicParticipation } from "@/state/public/schemas";

const COLLAPSED_COUNT = 5;

export function ParticipationsDetail({
  participations,
  edition,
}: {
  participations: PublicParticipation[];
  edition?: number;
}) {
  const [expanded, setExpanded] = useState(false);

  if (participations.length === 0) {
    return (
      <Text color="fg.muted" py="4" textAlign="center">
        Aucun tour enregistré
      </Text>
    );
  }

  const finished = participations.filter((p) => p.status === "FINISHED");
  const bestTime =
    finished.length > 0
      ? Math.min(...finished.map((p) => p.totalTime ?? Infinity))
      : null;

  const visible = expanded
    ? participations
    : participations.slice(0, COLLAPSED_COUNT);
  const hasMore = participations.length > COLLAPSED_COUNT;

  const header = edition
    ? `Détail des tours — ${edition} (${finished.length}/${participations.length})`
    : `Détail des tours (${finished.length}/${participations.length})`;

  return (
    <VStack align="stretch" gap="2">
      <Text
        fontSize="xs"
        color="fg.muted"
        textTransform="uppercase"
        letterSpacing="wider"
        fontWeight="semibold"
      >
        {header}
      </Text>

      {/* Mobile cards */}
      <VStack gap="2" display={{ base: "flex", md: "none" }}>
        {visible.map((p, i) => {
          const isBest = bestTime != null && p.totalTime === bestTime;
          return (
            <Card.Root
              key={p.id}
              w="full"
              size="sm"
              bg={
                isBest ? { base: "yellow.50", _dark: "orange.900" } : undefined
              }
              borderColor={
                isBest ? { base: "yellow.200", _dark: "orange.700" } : undefined
              }
            >
              <Card.Body>
                <HStack justify="space-between">
                  <HStack gap="1">
                    <Text fontWeight="bold">Tour {i + 1}</Text>
                    {isBest && <Text>⭐</Text>}
                  </HStack>
                  <Badge
                    colorPalette={p.status === "FINISHED" ? "green" : "yellow"}
                    size="sm"
                  >
                    {p.status === "FINISHED" ? "Terminé" : "En attente"}
                  </Badge>
                </HStack>
                <HStack gap="4" mt="2" fontSize="sm" color="fg.muted">
                  <Text fontFamily="mono">{formatTime(p.totalTime)}</Text>
                  <Text>4 km</Text>
                  <Text fontFamily="mono" color="fg.subtle">
                    {formatPace(p.totalTime)}
                  </Text>
                </HStack>
              </Card.Body>
            </Card.Root>
          );
        })}
      </VStack>

      {/* Desktop table */}
      <Box display={{ base: "none", md: "block" }} overflowX="auto">
        <Table.Root size="sm">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>#</Table.ColumnHeader>
              <Table.ColumnHeader>Temps</Table.ColumnHeader>
              <Table.ColumnHeader>Allure</Table.ColumnHeader>
              <Table.ColumnHeader>Distance</Table.ColumnHeader>
              <Table.ColumnHeader>Statut</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {visible.map((p, i) => {
              const isBest = bestTime != null && p.totalTime === bestTime;
              return (
                <Table.Row
                  key={p.id}
                  bg={
                    isBest
                      ? { base: "yellow.50", _dark: "yellow.950" }
                      : undefined
                  }
                >
                  <Table.Cell>
                    <HStack gap="1">
                      <Text>{i + 1}</Text>
                      {isBest && <Text>⭐</Text>}
                    </HStack>
                  </Table.Cell>
                  <Table.Cell fontFamily="mono">
                    {formatTime(p.totalTime)}
                  </Table.Cell>
                  <Table.Cell fontFamily="mono" color="fg.muted">
                    {formatPace(p.totalTime)}
                  </Table.Cell>
                  <Table.Cell>4 km</Table.Cell>
                  <Table.Cell>
                    <Badge
                      colorPalette={
                        p.status === "FINISHED" ? "green" : "yellow"
                      }
                      size="sm"
                    >
                      {p.status === "FINISHED" ? "Terminé" : "En attente"}
                    </Badge>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table.Root>
      </Box>

      {hasMore && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded((v) => !v)}
          color="fg.muted"
          alignSelf="center"
        >
          {expanded ? (
            <>
              <LuChevronUp /> Réduire
            </>
          ) : (
            <>
              <LuChevronDown /> Voir tous les tours
            </>
          )}
        </Button>
      )}
    </VStack>
  );
}
