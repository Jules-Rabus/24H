import { z } from "zod";
import { weatherResponseSchema } from "@/state/weather/schemas";

type WeatherResponse = z.infer<typeof weatherResponseSchema>;

export function buildWeather(
  overrides: Partial<WeatherResponse> = {},
): WeatherResponse {
  return {
    current: {
      temperature_2m: 14.5,
      weather_code: 3,
      apparent_temperature: 13.0,
      windspeed_10m: 10.0,
      relative_humidity_2m: 72,
      ...overrides.current,
    },
    hourly: {
      time: ["2026-03-28T10:00", "2026-03-28T11:00", "2026-03-28T12:00"],
      temperature_2m: [14.0, 14.5, 15.0],
      weather_code: [1, 2, 3],
      ...overrides.hourly,
    },
  };
}
