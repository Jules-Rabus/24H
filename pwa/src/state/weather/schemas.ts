import { z } from "zod"

export const weatherResponseSchema = z.object({
  current: z.object({
    temperature_2m: z.number(),
    weather_code: z.number(),
  }),
  hourly: z.object({
    temperature_2m: z.array(z.number()),
    weather_code: z.array(z.number()),
  }),
})

export type WeatherResponse = z.infer<typeof weatherResponseSchema>
