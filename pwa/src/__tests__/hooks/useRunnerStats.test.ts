import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useRunnerStats } from "@/hooks/useRunnerStats";
import { userCollectionSchema } from "@/state/public/schemas";
import type { PublicRunner } from "@/state/public/schemas";

const runner: PublicRunner = userCollectionSchema.parse({
  id: 1,
  firstName: "Jean",
  lastName: "Dupont",
  surname: null,
  email: null,
  organization: null,
  image: null,
  finishedParticipationsCount: 2,
  totalTime: 3240,
  bestTime: 1440,
  averageTime: 1620,
  participations: [
    {
      id: 1,
      runId: 1,
      runEdition: 2026,
      totalTime: 1440,
      status: "FINISHED",
      runStartDate: "2026-01-01T08:00:00Z",
      runEndDate: "2026-01-01T09:00:00Z",
      arrivalTime: null,
    },
    {
      id: 2,
      runId: 2,
      runEdition: 2026,
      totalTime: 1800,
      status: "FINISHED",
      runStartDate: "2026-01-01T09:00:00Z",
      runEndDate: "2026-01-01T10:00:00Z",
      arrivalTime: null,
    },
    {
      id: 3,
      runId: 3,
      runEdition: 2025,
      totalTime: 1560,
      status: "FINISHED",
      runStartDate: "2025-01-01T08:00:00Z",
      runEndDate: "2025-01-01T09:00:00Z",
      arrivalTime: null,
    },
  ],
});

describe("useRunnerStats", () => {
  it("computes stats2026 correctly", () => {
    const { result } = renderHook(() => useRunnerStats(runner));
    expect(result.current.stats2026.finishedCount).toBe(2);
    expect(result.current.stats2026.distance).toBe(8);
    expect(result.current.stats2026.bestTime).toBe(1440);
    expect(result.current.stats2026.averageTime).toBe(1620);
  });

  it("computes stats2025 correctly", () => {
    const { result } = renderHook(() => useRunnerStats(runner));
    expect(result.current.stats2025.finishedCount).toBe(1);
    expect(result.current.stats2025.bestTime).toBe(1560);
    expect(result.current.stats2025.distance).toBe(4);
  });

  it("builds chartData with both editions", () => {
    const { result } = renderHook(() => useRunnerStats(runner));
    const chartData = result.current.chartData;
    // max(2 participations 2026, 1 participation 2025) = 2 entries
    expect(chartData.length).toBe(2);
    expect(chartData[0]).toMatchObject({
      name: "T1",
      pace2026: 6,
      pace2025: 7,
    });
    // T2 has no 2025 counterpart
    expect(chartData[1]).toMatchObject({
      name: "T2",
      pace2026: 8,
      pace2025: null,
    });
  });

  it("splits participations by edition", () => {
    const { result } = renderHook(() => useRunnerStats(runner));
    expect(result.current.participations2026).toHaveLength(2);
    expect(result.current.participations2025).toHaveLength(1);
    expect(result.current.participations2026[0].runEdition).toBe(2026);
    expect(result.current.participations2025[0].runEdition).toBe(2025);
  });

  it("returns empty stats when runner is undefined", () => {
    const { result } = renderHook(() => useRunnerStats(undefined));
    expect(result.current.stats2026.finishedCount).toBe(0);
    expect(result.current.stats2026.bestTime).toBeNull();
    expect(result.current.chartData).toHaveLength(0);
  });
});
