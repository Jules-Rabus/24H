"use client";

import {
  Badge,
  Box,
  Card,
  HStack,
  Table,
  Text,
  VStack,
} from "@chakra-ui/react";
import { formatTime, formatTimeMinutes } from "@/utils/race";
import type { PublicParticipation } from "@/state/public/schemas";

export function ParticipationsDetail({
  participations,
}: {
  participations: PublicParticipation[];
}) {
  if (participations.length === 0) {
    return (
      <Text color="fg.muted" py="4" textAlign="center">
        Aucun tour enregistré
      </Text>
    );
  }

  return (
    <>
      {/* Mobile cards */}
      <VStack gap="2" display={{ base: "flex", md: "none" }}>
        {participations.map((p, i) => (
          <Card.Root key={p.id} w="full" size="sm">
            <Card.Body>
              <HStack justify="space-between">
                <Text fontWeight="bold">Tour {i + 1}</Text>
                <Badge
                  colorPalette={p.status === "FINISHED" ? "green" : "yellow"}
                  size="sm"
                >
                  {p.status === "FINISHED" ? "Terminé" : "En cours"}
                </Badge>
              </HStack>
              <HStack gap="4" mt="2" fontSize="sm" color="fg.muted">
                <Text>{formatTimeMinutes(p.totalTime)}</Text>
                <Text>4 km</Text>
              </HStack>
            </Card.Body>
          </Card.Root>
        ))}
      </VStack>

      {/* Desktop table */}
      <Box display={{ base: "none", md: "block" }} overflowX="auto">
        <Table.Root size="sm">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>#</Table.ColumnHeader>
              <Table.ColumnHeader>Temps</Table.ColumnHeader>
              <Table.ColumnHeader>Distance</Table.ColumnHeader>
              <Table.ColumnHeader>Statut</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {participations.map((p, i) => (
              <Table.Row key={p.id}>
                <Table.Cell>{i + 1}</Table.Cell>
                <Table.Cell fontFamily="mono">
                  {formatTime(p.totalTime)}
                </Table.Cell>
                <Table.Cell>4 km</Table.Cell>
                <Table.Cell>
                  <Badge
                    colorPalette={p.status === "FINISHED" ? "green" : "yellow"}
                    size="sm"
                  >
                    {p.status === "FINISHED" ? "Terminé" : "En cours"}
                  </Badge>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>
    </>
  );
}
