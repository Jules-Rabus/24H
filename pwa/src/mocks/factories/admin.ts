import { z } from "zod";

// Mirror the Zod schemas from admin query files for type inference
const adminRunSchema = z.object({
  id: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  participantsCount: z.number().optional(),
  inProgressParticipantsCount: z.number().optional(),
  finishedParticipantsCount: z.number().optional(),
  averageTime: z.number().nullish(),
  fastestTime: z.number().nullish(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

const adminUserSchema = z.object({
  id: z.number().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  surname: z.string().nullish(),
  email: z.string().nullish(),
  roles: z.array(z.string()).optional(),
  organization: z.string().nullish(),
  participations: z.array(z.number()).optional(),
  finishedParticipationsCount: z.number().optional(),
  totalTime: z.number().nullish(),
  bestTime: z.number().nullish(),
  averageTime: z.number().nullish(),
  image: z.string().nullish(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

const runRefSchema = z.object({
  id: z.number().nullish(),
  startDate: z.string().nullish(),
  endDate: z.string().nullish(),
});

const userRefSchema = z.object({
  id: z.number().nullish(),
  firstName: z.string().nullish(),
  lastName: z.string().nullish(),
  surname: z.string().nullish(),
  image: z.string().nullish(),
});

const adminParticipationSchema = z.object({
  id: z.number().optional(),
  run: runRefSchema.nullish(),
  user: userRefSchema.nullish(),
  arrivalTime: z.string().nullish(),
  totalTime: z.number().nullish(),
  status: z.string().optional(),
});

export type AdminRun = z.infer<typeof adminRunSchema>;
export type AdminUser = z.infer<typeof adminUserSchema>;
export type AdminParticipation = z.infer<typeof adminParticipationSchema>;

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
