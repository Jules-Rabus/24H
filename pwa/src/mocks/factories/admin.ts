import type { AdminRun } from "@/state/admin/runs/schemas";
import type { AdminUser } from "@/state/admin/users/schemas";
import type { AdminParticipation } from "@/state/admin/participations/schemas";

export type { AdminRun, AdminUser, AdminParticipation };

let adminRunId = 1;
let adminUserId = 1;
let adminParticipationId = 1;

export function buildAdminRun(overrides: Partial<AdminRun> = {}): AdminRun {
  const id = overrides.id ?? adminRunId++;
  return {
    id,
    startDate: "2026-03-15T08:00:00+00:00",
    endDate: "2026-03-15T08:30:00+00:00",
    participantsCount: 10,
    inProgressParticipantsCount: 3,
    finishedParticipantsCount: 7,
    averageTime: 1620,
    fastestTime: 1320,
    ...overrides,
  };
}

export function buildAdminUser(overrides: Partial<AdminUser> = {}): AdminUser {
  const id = overrides.id ?? adminUserId++;
  return {
    id,
    firstName: "Jean",
    lastName: "Dupont",
    surname: null,
    email: `user${id}@example.com`,
    roles: ["ROLE_USER"],
    organization: null,
    finishedParticipationsCount: 5,
    totalTime: 9000,
    bestTime: 1440,
    averageTime: 1800,
    image: null,
    editions: [],
    ...overrides,
  };
}

export function buildAdminParticipation(
  overrides: Partial<AdminParticipation> = {},
): AdminParticipation {
  const id = overrides.id ?? adminParticipationId++;
  return {
    id,
    run: {
      id: 1,
      startDate: "2026-03-15T08:00:00+00:00",
      endDate: "2026-03-15T08:30:00+00:00",
    },
    user: {
      id: 1,
      firstName: "Jean",
      lastName: "Dupont",
      surname: null,
      image: null,
    },
    arrivalTime: "2026-03-15T08:24:00+00:00",
    totalTime: 1440,
    status: "FINISHED",
    ...overrides,
  };
}

export function resetAdminIds(): void {
  adminRunId = 1;
  adminUserId = 1;
  adminParticipationId = 1;
}
