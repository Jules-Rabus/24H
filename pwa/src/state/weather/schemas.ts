import { z } from "zod";

export const weatherResponseSchema = z.object({
  current: z.object({
    temperature_2m: z.number(),
    weather_code: z.number(),
    apparent_temperature: z.number().optional(),
    windspeed_10m: z.number().optional(),
    relative_humidity_2m: z.number().optional(),
    rain: z.number().nullish(),
    uv_index: z.number().nullish(),
  }),
  // Open-Meteo can pad arrays with nulls past the model horizon
  // (e.g. meteofrance_seamless ≈ 4 days, daily forecast still returned for 7).
  hourly: z.object({
    time: z.array(z.string()),
    temperature_2m: z.array(z.number().nullable()),
    weather_code: z.array(z.number().nullable()),
    apparent_temperature: z.array(z.number().nullable()).optional(),
    windspeed_10m: z.array(z.number().nullable()).optional(),
    relative_humidity_2m: z.array(z.number().nullable()).optional(),
    rain: z.array(z.number().nullable()).optional(),
    uv_index: z.array(z.number().nullable()).optional(),
  }),
  // 15-min steps used by the "rain in the next hour" mini-chart.
  minutely_15: z
    .object({
      time: z.array(z.string()),
      rain: z.array(z.number().nullable()).optional(),
    })
    .optional(),
  daily: z
    .object({
      time: z.array(z.string()),
      sunrise: z.array(z.string()),
      sunset: z.array(z.string()),
      uv_index_max: z.array(z.number().nullable()).optional(),
    })
    .optional(),
});

export type WeatherResponse = z.infer<typeof weatherResponseSchema>;
