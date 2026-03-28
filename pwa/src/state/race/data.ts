import { RunsCollection, ParticipationsCollection } from "./schemas"

export const mockRunsCollection: RunsCollection = {
  member: [
    {
      id: 1,
      startDate: "2024-06-01T08:00:00+00:00",
      endDate: "2024-06-01T08:30:00+00:00",
      participantsCount: 5,
    },
  ],
  totalItems: 1,
}

export const mockParticipationsCollection: ParticipationsCollection = {
  member: [
    {
      id: 1,
      run: { id: 1, startDate: "2024-06-01T08:00:00+00:00", endDate: "2024-06-01T08:30:00+00:00" },
      user: { id: 1, firstName: "Jean", lastName: "Dupont", surname: "Speed" },
      arrivalTime: "2024-06-01T08:25:00+00:00",
      totalTime: 1500,
      status: "FINISHED",
    },
  ],
  totalItems: 1,
}
