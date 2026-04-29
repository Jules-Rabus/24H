"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatPaceSecPerKm } from "@/utils/race";

type ChartPoint = {
  name: string;
  pace2026: number | null;
  pace2025: number | null;
};

function CustomLegend() {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        justifyContent: "flex-end",
        marginBottom: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <div style={{ width: 16, height: 2, background: "#0f929a" }} />
        <span style={{ fontSize: 11, color: "#64748b" }}>2026</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <div style={{ width: 16, height: 2, background: "#94a3b8" }} />
        <span style={{ fontSize: 11, color: "#64748b" }}>2025</span>
      </div>
    </div>
  );
}

export function PaceChart({ data }: { data: ChartPoint[] }) {
  if (data.length === 0) return null;
  return (
    <>
      <CustomLegend />
      <ResponsiveContainer width="100%" height={140}>
        <LineChart
          data={data}
          margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
        >
          <CartesianGrid
            strokeDasharray="0"
            stroke="#e2e8f0"
            strokeWidth={0.5}
          />
          <XAxis
            dataKey="name"
            fontSize={10}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) =>
              formatPaceSecPerKm(Number(v)).replace("/km", "")
            }
          />
          <Tooltip
            formatter={(v) => [formatPaceSecPerKm(Number(v))]}
            labelFormatter={(l) => `Tour ${l.replace("T", "")}`}
          />
          <Line
            type="monotone"
            dataKey="pace2026"
            name="2026"
            stroke="#0f929a"
            strokeWidth={2}
            dot={false}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="pace2025"
            name="2025"
            stroke="#94a3b8"
            strokeWidth={1.5}
            dot={false}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </>
  );
}
