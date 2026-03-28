import { z } from "zod"

export const weatherResponseSchema = z.object({
  current: z.object({
    temperature_2m: z.number(),
    weather_code: z.number(),
    apparent_temperature: z.number().optional(),
    windspeed_10m: z.number().optional(),
    relative_humidity_2m: z.number().optional(),
  }),
  hourly: z.object({
    time: z.array(z.string()),
    temperature_2m: z.array(z.number()),
    weather_code: z.array(z.number()),
  }),
})

export type WeatherResponse = z.infer<typeof weatherResponseSchema>
