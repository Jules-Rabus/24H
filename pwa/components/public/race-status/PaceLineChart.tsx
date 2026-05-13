"use client";

import { Box, Flex, HStack, Heading, Text } from "@chakra-ui/react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TEAL, fmtPace } from "./utils";

export type PaceChartPoint = {
  name: string;
  secPerKm2026: number | null;
  secPerKm2025: number | null;
  isCurrent: boolean;
};

type PaceLineChartProps = {
  data: PaceChartPoint[];
  /** When true, no fixed width — fill parent (used on mobile). */
  fluid?: boolean;
};

const PREV_COLOR = "#f97316";

/**
 * Line chart of average pace per Run, superposing 2026 vs 2025 on the same R1..Rn axis.
 * Matches the runner detail PaceChart's visual conventions (solid teal + dashed orange).
 */
export function PaceLineChart({ data, fluid = false }: PaceLineChartProps) {
  const has2026 = data.some((d) => d.secPerKm2026 != null);
  const has2025 = data.some((d) => d.secPerKm2025 != null);
  const hasAny = has2026 || has2025;

  return (
    <Flex
      direction="column"
      style={fluid ? undefined : { width: "33%" }}
      flexShrink={0}
      p="4"
      gap="2"
      overflow="hidden"
      h="100%"
    >
      <HStack justify="space-between" align="center" flexShrink={0}>
        <Heading
          size="sm"
          fontWeight="900"
          letterSpacing="tight"
          textTransform="uppercase"
          color="fg.muted"
        >
          Allure moy. / Run
        </Heading>
        <HStack gap="3" fontSize="xs" color="fg.muted">
          {has2026 && (
            <HStack gap="1">
              <Box w="3" h="0.5" bg={TEAL} />
              <Text>2026</Text>
            </HStack>
          )}
          {has2025 && (
            <HStack gap="1">
              <Box
                w="3"
                h="0"
                borderTopWidth="2px"
                borderColor={PREV_COLOR}
                borderStyle="dashed"
              />
              <Text>2025</Text>
            </HStack>
          )}
        </HStack>
      </HStack>
      {hasAny ? (
        <Box flex="1" minH="200px">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 4, right: 8, bottom: 0, left: 8 }}
            >
              <CartesianGrid
                strokeDasharray="0"
                stroke="rgba(127,127,127,0.18)"
                strokeWidth={0.5}
              />
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
                reversed
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
                formatter={(v, name) => [
                  fmtPace(Number(v ?? 0)),
                  name === "secPerKm2026" ? "2026" : "2025",
                ]}
              />
              <Line
                type="monotone"
                dataKey="secPerKm2026"
                stroke={TEAL}
                strokeWidth={2}
                dot={(props) => {
                  const { cx, cy, payload, index } = props as {
                    cx: number;
                    cy: number;
                    payload: PaceChartPoint;
                    index: number;
                  };
                  const isCurrent = payload?.isCurrent;
                  return (
                    <circle
                      key={`p26-${index}`}
                      cx={cx}
                      cy={cy}
                      r={isCurrent ? 4 : 2}
                      fill={isCurrent ? TEAL : "rgba(127,127,127,0.55)"}
                      stroke={isCurrent ? TEAL : "rgba(127,127,127,0.55)"}
                    />
                  );
                }}
                activeDot={{ r: 5 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="secPerKm2025"
                stroke={PREV_COLOR}
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      ) : (
        <Flex
          flex="1"
          align="center"
          justify="center"
          color="fg.subtle"
          fontSize="sm"
          textAlign="center"
          minH="120px"
        >
          Données insuffisantes
        </Flex>
      )}
    </Flex>
  );
}
