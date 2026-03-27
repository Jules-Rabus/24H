import { http, HttpResponse } from "msw"

export const runnersHandlers = [
  http.get("*/users/public", () => {
    return HttpResponse.json({
      "@context": "/contexts/User",
      "@id": "/users/public",
      "@type": "hydra:Collection",
      member: [
        {
          "@id": "/users/1",
          "@type": "User",
          id: 1,
          firstName: "Jean",
          lastName: "Dupont",
          surname: null,
          organization: null,
        },
        {
          "@id": "/users/2",
          "@type": "User",
          id: 2,
          firstName: "Marie",
          lastName: "Curie",
          surname: null,
          organization: null,
        },
      ],
      "hydra:totalItems": 2,
    })
  }),
]
