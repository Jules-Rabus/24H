import { http, HttpResponse } from "msw"

export const raceHandlers = [
  http.get("*/runs", () => {
    return HttpResponse.json({
      "@context": "/contexts/Run",
      "@id": "/runs",
      "@type": "hydra:Collection",
      member: [
        {
          "@id": "/runs/1",
          "@type": "Run",
          id: 1,
          startDate: "2024-06-01T08:00:00+00:00",
          endDate: "2024-06-01T08:30:00+00:00",
          participantsCount: 5,
        },
      ],
      "hydra:totalItems": 1,
    })
  }),

  http.get("*/participations", () => {
    return HttpResponse.json({
      "@context": "/contexts/Participation",
      "@id": "/participations",
      "@type": "hydra:Collection",
      member: [
        {
          "@id": "/participations/1",
          "@type": "Participation",
          id: 1,
          run: "/runs/1",
          user: "/users/1",
          arrivalTime: "2024-06-01T08:25:00+00:00",
          totalTime: 1500,
          status: "FINISHED",
        },
      ],
      "hydra:totalItems": 1,
    })
  }),
]
