"use client";

import {
  Box,
  Flex,
  Grid,
  HStack,
  Icon,
  Skeleton,
  Text,
} from "@chakra-ui/react";
import { LuDroplets, LuThermometer, LuWind } from "react-icons/lu";
import type { WeatherResponse } from "@/state/weather/queries";
import { getWeatherIcon } from "./utils";

type WeatherPanelProps = {
  isLoading: boolean;
  weatherData: WeatherResponse | undefined;
  now: number;
};

export function WeatherPanel({
  isLoading,
  weatherData,
  now,
}: WeatherPanelProps) {
  const currentTemp = weatherData?.current.temperature_2m ?? "--";
  const apparentTemp = weatherData?.current.apparent_temperature;
  const windSpeed = weatherData?.current.windspeed_10m;
  const humidity = weatherData?.current.relative_humidity_2m;
  const currentWeatherCode = weatherData?.current.weather_code ?? 0;
  const WeatherIcon = getWeatherIcon(currentWeatherCode);

  const hourlyForecast =
    weatherData?.hourly.time
      .map((t, i) => ({
        time: t,
        temp: weatherData.hourly.temperature_2m[i],
        code: weatherData.hourly.weather_code[i],
      }))
      .filter((h) => new Date(h.time).getTime() > now)
      .slice(0, 5) ?? [];

  return (
    <Flex direction="column" gap="2" p="4" overflow="hidden">
      {/* Actuelle — grande */}
      <Flex
        align="center"
        justify="space-between"
        flexShrink={0}
        p="3"
        bg="whiteAlpha.50"
        rounded="xl"
      >
        {isLoading ? (
          <Flex direction="column" gap="2" flex="1">
            <Skeleton h="3" w="40%" rounded="md" />
            <Skeleton h="10" w="60%" rounded="md" />
          </Flex>
        ) : (
          <>
            <Box>
              <Text
                fontSize="xs"
                fontWeight="700"
                letterSpacing="0.12em"
                textTransform="uppercase"
                color="gray.500"
                mb="1"
              >
                Météo actuelle
              </Text>
              <HStack gap="3" align="baseline">
                <Text
                  fontSize="4xl"
                  fontWeight="900"
                  color="gray.100"
                  lineHeight="1"
                >
                  {currentTemp}°C
                </Text>
                <Icon as={WeatherIcon} boxSize="8" color="primary.300" />
              </HStack>
            </Box>
            <Grid templateColumns="1fr 1fr" gap="2">
              {apparentTemp !== undefined && (
                <HStack gap="1.5" p="2" bg="whiteAlpha.50" rounded="lg">
                  <Icon as={LuThermometer} boxSize="4" color="gray.400" />
                  <Box>
                    <Text
                      fontSize="10px"
                      color="gray.500"
                      textTransform="uppercase"
                      letterSpacing="wider"
                    >
                      Ressenti
                    </Text>
                    <Text fontSize="sm" fontWeight="800" color="gray.200">
                      {apparentTemp}°C
                    </Text>
                  </Box>
                </HStack>
              )}
              {windSpeed !== undefined && (
                <HStack gap="1.5" p="2" bg="whiteAlpha.50" rounded="lg">
                  <Icon as={LuWind} boxSize="4" color="gray.400" />
                  <Box>
                    <Text
                      fontSize="10px"
                      color="gray.500"
                      textTransform="uppercase"
                      letterSpacing="wider"
                    >
                      Vent
                    </Text>
                    <Text fontSize="sm" fontWeight="800" color="gray.200">
                      {windSpeed} km/h
                    </Text>
                  </Box>
                </HStack>
              )}
              {humidity !== undefined && (
                <HStack gap="1.5" p="2" bg="whiteAlpha.50" rounded="lg">
                  <Icon as={LuDroplets} boxSize="4" color="gray.400" />
                  <Box>
                    <Text
                      fontSize="10px"
                      color="gray.500"
                      textTransform="uppercase"
                      letterSpacing="wider"
                    >
                      Humidité
                    </Text>
                    <Text fontSize="sm" fontWeight="800" color="gray.200">
                      {humidity}%
                    </Text>
                  </Box>
                </HStack>
              )}
            </Grid>
          </>
        )}
      </Flex>

      {/* Prévisions horaires */}
      {isLoading ? (
        <HStack gap="1.5" flex="1" align="stretch">
          {Array.from({ length: 5 }).map((_, i) => (
            <Flex
              key={i}
              direction="column"
              align="center"
              justify="space-between"
              flex="1"
              p="2"
              bg="whiteAlpha.50"
              rounded="lg"
              gap="2"
            >
              <Skeleton h="3" w="full" rounded="md" />
              <Skeleton h="5" w="5" rounded="full" />
              <Skeleton h="5" w="8" rounded="md" />
            </Flex>
          ))}
        </HStack>
      ) : hourlyForecast.length > 0 ? (
        <HStack gap="1.5" flex="1" align="stretch">
          {hourlyForecast.map((h, i) => {
            const HIcon = getWeatherIcon(h.code);
            return (
              <Flex
                key={i}
                direction="column"
                align="center"
                justify="space-between"
                flex="1"
                p="2"
                bg="whiteAlpha.50"
                rounded="lg"
                borderTopWidth="2px"
                borderTopColor={i === 0 ? "primary.500" : "transparent"}
              >
                <Text fontSize="xs" color="gray.500" fontWeight="600">
                  {new Date(h.time).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
                <Icon
                  as={HIcon}
                  boxSize="5"
                  color={i === 0 ? "primary.300" : "gray.500"}
                />
                <Text
                  fontSize="md"
                  fontWeight="900"
                  color={i === 0 ? "gray.100" : "gray.400"}
                >
                  {h.temp}°
                </Text>
              </Flex>
            );
          })}
        </HStack>
      ) : null}
    </Flex>
  );
}
