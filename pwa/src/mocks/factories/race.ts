import { z } from "zod";
import { runSchema } from "@/state/race/schemas";

type Run = z.infer<typeof runSchema>;

let runId = 1;

export function buildRun(overrides: Partial<Run> = {}): Run {
  const id = overrides.id ?? runId++;
  return {
    id,
    startDate: "2024-06-01T08:00:00+00:00",
    endDate: "2024-06-01T08:30:00+00:00",
    participantsCount: 5,
    // Per-run aggregates used by the public race-status pages (StatsPanel,
    // chart). Default to plausible values so /course renders something even
    // when a mock run hasn't been customised.
    finishedParticipantsCount: 0,
    inProgressParticipantsCount: 0,
    averageTime: null,
    fastestTime: null,
    ...overrides,
  };
}

export function resetRunIds(): void {
  runId = 1;
}
