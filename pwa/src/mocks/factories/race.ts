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
    ...overrides,
  };
}

export function resetRunIds(): void {
  runId = 1;
}
