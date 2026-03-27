import { http, HttpResponse } from "msw"

export const mediaHandlers = [
  http.post("*/race_medias", () => {
    return HttpResponse.json(
      {
        "@id": "/race_medias/1",
        "@type": "RaceMedia",
        id: 1,
        filePath: "test.png",
      },
      { status: 201 },
    )
  }),
]
