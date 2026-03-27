import { useQuery } from "@tanstack/react-query"
import axios from "axios"

export const weatherKeys = {
  all: ["weather"] as const,
  forecast: (lat: number, lon: number) => [...weatherKeys.all, lat, lon] as const,
}

async function fetchWeather(lat: number, lon: number) {
  const { data } = await axios.get("https://api.open-meteo.com/v1/forecast", {
    params: {
      latitude: lat,
      longitude: lon,
      current: "temperature_2m,weather_code",
      hourly: "temperature_2m,weather_code",
      timezone: "Europe/Paris",
    },
  })
  return data
}

export function useWeatherQuery(lat: number, lon: number) {
  return useQuery({
    queryKey: weatherKeys.forecast(lat, lon),
    queryFn: () => fetchWeather(lat, lon),
    staleTime: 5 * 60 * 1000,
  })
}
