import { http, HttpResponse } from "msw"

export const weatherHandlers = [
  http.get("https://api.open-meteo.com/v1/forecast", () => {
    return HttpResponse.json({
      current: { temperature_2m: 14.5, weather_code: 3 },
      hourly: {
        temperature_2m: [14.0, 14.5, 15.0],
        weather_code: [1, 2, 3],
      },
    })
  }),
]
