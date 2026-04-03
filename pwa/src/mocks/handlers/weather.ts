import { http, HttpResponse } from "msw";
import { buildWeather } from "../factories";

export const weatherHandlers = [
  http.get("https://api.open-meteo.com/v1/forecast", () => {
    return HttpResponse.json(buildWeather());
  }),
];
