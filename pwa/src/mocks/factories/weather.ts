import { z } from "zod";
import { weatherResponseSchema } from "@/state/weather/schemas";

type WeatherResponse = z.infer<typeof weatherResponseSchema>;

/** Build a hourly timeline anchored on the current wall clock so the
 *  `now > h.time` filter in WeatherPanel keeps producing visible forecasts. */
function buildHourlyTimeline(count: number) {
  const start = new Date();
  start.setMinutes(0, 0, 0);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(start.getTime() + i * 3600 * 1000);
    // open-meteo returns local time strings like "2026-03-28T10:00"
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });
}

function buildSunTime(hour: number, minute: number) {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

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
      time: buildHourlyTimeline(12),
      temperature_2m: [
        14.0, 14.5, 15.0, 15.5, 16.0, 15.5, 14.5, 13.0, 12.5, 12.0, 11.5, 11.0,
      ],
      weather_code: [1, 2, 3, 2, 1, 1, 2, 3, 3, 2, 2, 1],
      apparent_temperature: [
        12.5, 13.0, 13.5, 14.0, 14.5, 14.0, 13.0, 11.5, 11.0, 10.5, 10.0, 9.5,
      ],
      windspeed_10m: [10, 12, 14, 15, 13, 11, 10, 9, 9, 8, 8, 7],
      relative_humidity_2m: [72, 70, 68, 65, 62, 65, 70, 75, 78, 80, 82, 85],
      ...overrides.hourly,
    },
    daily: {
      time: [new Date().toISOString().slice(0, 10)],
      sunrise: [buildSunTime(7, 12)],
      sunset: [buildSunTime(19, 42)],
      ...overrides.daily,
    },
  };
}
