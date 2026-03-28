import { WeatherResponse } from "./schemas"

export const mockWeatherResponse: WeatherResponse = {
  current: {
    temperature_2m: 22.5,
    weather_code: 0,
    apparent_temperature: 21.0,
    windspeed_10m: 12.0,
    relative_humidity_2m: 65,
  },
  hourly: {
    time: ["2026-03-28T10:00", "2026-03-28T11:00", "2026-03-28T12:00", "2026-03-28T13:00"],
    temperature_2m: [20, 21, 22, 23],
    weather_code: [0, 0, 1, 1],
  },
}
