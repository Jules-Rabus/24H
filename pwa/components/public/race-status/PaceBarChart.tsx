"use client";

import { Box, Flex, Heading } from "@chakra-ui/react";
import {
  Bar,
  BarChart,
  Cell,
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
            <BarChart
              data={data}
              margin={{ top: 4, right: 8, bottom: 0, left: 8 }}
            >
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
              <Bar dataKey="secPerKm" radius={[3, 3, 0, 0]}>
                {data.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.isCurrent ? TEAL : "rgba(255,255,255,0.12)"}
                  />
                ))}
              </Bar>
            </BarChart>
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
