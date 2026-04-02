"use client";

import { Table } from "@chakra-ui/react";
import { formatTime, formatPace } from "@/utils/race";
import type { EditionStats } from "@/state/public/schemas";

export function EditionCompareTable({
  stats2026,
  stats2025,
}: {
  stats2026: EditionStats;
  stats2025: EditionStats;
}) {
  const rows = [
    {
      label: "Tours",
      v26: String(stats2026.finishedCount),
      v25: String(stats2025.finishedCount),
    },
    {
      label: "Distance",
      v26: `${stats2026.distance} km`,
      v25: `${stats2025.distance} km`,
    },
    {
      label: "Meilleur temps",
      v26: formatTime(stats2026.bestTime),
      v25: formatTime(stats2025.bestTime),
    },
    {
      label: "Allure moy.",
      v26: formatPace(stats2026.averageTime),
      v25: formatPace(stats2025.averageTime),
    },
  ];

  return (
    <Table.Root size="sm">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader color="teal.500" fontWeight="bold">
            2026
          </Table.ColumnHeader>
          <Table.ColumnHeader textAlign="center">Métrique</Table.ColumnHeader>
          <Table.ColumnHeader textAlign="right" color="fg.muted">
            2025
          </Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {rows.map((row) => (
          <Table.Row key={row.label}>
            <Table.Cell color="teal.500" fontWeight="semibold">
              {row.v26}
            </Table.Cell>
            <Table.Cell textAlign="center" color="fg.muted" fontSize="xs">
              {row.label}
            </Table.Cell>
            <Table.Cell textAlign="right" color="fg.muted">
              {row.v25}
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
