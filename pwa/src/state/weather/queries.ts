import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { weatherResponseSchema, type WeatherResponse } from "./schemas";

export type { WeatherResponse };

export const weatherKeys = {
  all: ["weather"] as const,
  forecast: (lat: number, lon: number) =>
    [...weatherKeys.all, lat, lon] as const,
};

async function fetchWeather(
  lat: number,
  lon: number,
): Promise<WeatherResponse> {
  const { data } = await axios.get("https://api.open-meteo.com/v1/forecast", {
    params: {
      latitude: lat,
      longitude: lon,
      current:
        "temperature_2m,weather_code,apparent_temperature,windspeed_10m,relative_humidity_2m",
      hourly: "temperature_2m,weather_code",
      timezone: "Europe/Paris",
    },
  });
  return weatherResponseSchema.parse(data);
}

export function useWeatherQuery(lat: number, lon: number) {
  return useQuery({
    queryKey: weatherKeys.forecast(lat, lon),
    queryFn: () => fetchWeather(lat, lon),
    staleTime: 5 * 60 * 1000,
  });
}
