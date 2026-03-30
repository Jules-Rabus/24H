export const mockRaceStatusData = {
  totalRunners: 42,
  totalDistance: 150000,
  lastRunners: [
    { bibNumber: "123", time: new Date().toISOString() },
    { bibNumber: "456", time: new Date().toISOString() },
  ],
  recentMedias: [{ url: "/test-image.jpg" }],
  leaderboard: [
    { teamName: "Equipe A", totalDistance: 10000 },
    { teamName: "Equipe B", totalDistance: 9000 },
  ],
};

export const mockParticipationsData = {
  "hydra:member": [
    {
      runner: {
        user: { firstName: "Jean", lastName: "Dupont" },
        bibNumber: "123",
      },
      createdAt: new Date().toISOString(),
    },
  ],
};

export const mockRunsData = {
  "hydra:member": [
    {
      startDate: new Date(Date.now() - 3600 * 1000).toISOString(),
      endDate: new Date(Date.now() + 3600 * 1000).toISOString(),
    },
  ],
};

export const mockMediasData = {
  "hydra:member": [{ fileUrl: "/test-image.jpg" }],
};
