"use client";

import { Box, Flex, Heading } from "@chakra-ui/react";
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
  secPerKm: number;
  isCurrent: boolean;
};

type PaceBarChartProps = {
  data: PaceChartPoint[];
};

/**
 * Line chart of average pace per Run, matching the runner detail PaceChart visual.
 * Kept as `PaceBarChart` export to avoid touching the call site.
 */
export function PaceBarChart({ data }: PaceBarChartProps) {
  return (
    <Flex
      direction="column"
      style={{ width: "33%" }}
      flexShrink={0}
      p="4"
      gap="2"
      overflow="hidden"
    >
      <Heading
        size="sm"
        fontWeight="900"
        letterSpacing="tight"
        textTransform="uppercase"
        color="gray.400"
        flexShrink={0}
      >
        Allure moy. / Run
      </Heading>
      {data.some((d) => d.secPerKm > 0) ? (
        <Box flex="1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 4, right: 8, bottom: 0, left: 8 }}
            >
              <CartesianGrid
                strokeDasharray="0"
                stroke="rgba(255,255,255,0.08)"
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
                formatter={(v) => [fmtPace(Number(v ?? 0)), "Allure moy."]}
              />
              <Line
                type="monotone"
                dataKey="secPerKm"
                stroke={TEAL}
                strokeWidth={2}
                dot={(props) => {
                  // Highlight the in-progress Run with a filled dot, others discreet.
                  const { cx, cy, payload, index } = props as {
                    cx: number;
                    cy: number;
                    payload: PaceChartPoint;
                    index: number;
                  };
                  const isCurrent = payload?.isCurrent;
                  return (
                    <circle
                      key={index}
                      cx={cx}
                      cy={cy}
                      r={isCurrent ? 4 : 2}
                      fill={isCurrent ? TEAL : "rgba(255,255,255,0.45)"}
                      stroke={isCurrent ? TEAL : "rgba(255,255,255,0.45)"}
                    />
                  );
                }}
                activeDot={{ r: 5 }}
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
          color="gray.700"
          fontSize="sm"
          textAlign="center"
        >
          Données insuffisantes
        </Flex>
      )}
    </Flex>
  );
}
