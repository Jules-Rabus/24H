import { z } from "zod";
import {
  userCollectionSchema,
  publicParticipationSchema,
} from "@/state/public/schemas";

type PublicParticipation = z.infer<typeof publicParticipationSchema>;
type PublicRunner = z.infer<typeof userCollectionSchema>;
type MockRunner = PublicRunner & { "@id": string; "@type": string };

let participationId = 1;
let runnerId = 1;

export function buildParticipation(
  overrides: Partial<PublicParticipation> = {},
): PublicParticipation {
  return {
    id: participationId++,
    runId: 1,
    runStartDate: "2026-03-15T08:00:00Z",
    runEndDate: "2026-03-15T08:30:00Z",
    runEdition: 2026,
    arrivalTime: "2026-03-15T08:24:00Z",
    totalTime: 1440,
    status: "FINISHED",
    ...overrides,
  };
}

export function buildRunner(overrides: Partial<MockRunner> = {}): MockRunner {
  const id = overrides.id ?? runnerId++;
  return {
    "@id": `/users/${id}`,
    "@type": "User",
    id,
    firstName: "Jean",
    lastName: "Dupont",
    surname: null,
    email: null,
    organization: "ACBB",
    image: null,
    finishedParticipationsCount: 8,
    totalTime: 14400,
    bestTime: 1440,
    averageTime: 1800,
    participations: [],
    ...overrides,
  };
}

export function resetRunnerIds(): void {
  participationId = 1;
  runnerId = 1;
}
