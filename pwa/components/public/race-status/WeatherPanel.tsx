"use client";

import {
  Box,
  Flex,
  Grid,
  HStack,
  Icon,
  Skeleton,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  LuDroplets,
  LuSunrise,
  LuSunset,
  LuThermometer,
  LuWind,
} from "react-icons/lu";
import type { WeatherResponse } from "@/state/weather/queries";
import { getWeatherIcon } from "./utils";

type WeatherPanelProps = {
  isLoading: boolean;
  weatherData: WeatherResponse | undefined;
  now: number;
};

/**
 * Desktop weather panel. One single section, no gap : the "Météo actuelle"
 * header sits next to a 5-slot grid of current metrics (Ressenti, Vent,
 * Humidité, Lever, Coucher) ; the hourly forecast strip lives just below with
 * the same metrics per hour (temp + apparent + wind + humidity).
 */
export function WeatherPanel({
  isLoading,
  weatherData,
  now,
}: WeatherPanelProps) {
  const current = weatherData?.current;
  const sunrise = weatherData?.daily?.sunrise?.[0];
  const sunset = weatherData?.daily?.sunset?.[0];
  const WeatherIcon = getWeatherIcon(current?.weather_code ?? 0);

  const hourlyForecast =
    weatherData?.hourly.time
      .map((t, i) => ({
        time: t,
        temp: weatherData.hourly.temperature_2m[i],
        code: weatherData.hourly.weather_code[i],
        apparent: weatherData.hourly.apparent_temperature?.[i],
        wind: weatherData.hourly.windspeed_10m?.[i],
        humidity: weatherData.hourly.relative_humidity_2m?.[i],
      }))
      .filter((h) => new Date(h.time).getTime() > now)
      .slice(0, 5) ?? [];

  return (
    <Flex direction="column" gap="3" p="4" overflow="hidden">
      {/* Top row : current — temp + icon to the left, 5 metrics in a row to the right */}
      <Grid
        templateColumns={{
          base: "1fr",
          md: "minmax(220px, 1fr) minmax(0, 2fr)",
        }}
        gap="3"
        alignItems="stretch"
        flexShrink={0}
      >
        {isLoading ? (
          <>
            <Skeleton h="20" rounded="xl" />
            <Skeleton h="20" rounded="xl" />
          </>
        ) : (
          <>
            <HStack
              align="center"
              justify="space-between"
              gap="3"
              p="3"
              bg="bg.subtle"
              borderWidth="1px"
              borderColor="border.subtle"
              rounded="xl"
            >
              <Box>
                <Text
                  fontSize="xs"
                  fontWeight="700"
                  letterSpacing="0.1em"
                  textTransform="uppercase"
                  color="fg.muted"
                  mb="1"
                >
                  Météo actuelle
                </Text>
                <HStack gap="2" align="baseline">
                  <Text
                    fontSize="4xl"
                    fontWeight="900"
                    color="fg"
                    lineHeight="1"
                    fontVariantNumeric="tabular-nums"
                  >
                    {current?.temperature_2m != null
                      ? `${Math.round(current.temperature_2m)}°`
                      : "—"}
                  </Text>
                </HStack>
              </Box>
              <Icon as={WeatherIcon} boxSize="10" color="primary.fg" />
            </HStack>

            <Grid templateColumns="repeat(5, minmax(0, 1fr))" gap="2" flex="1">
              <CurrentMetric
                icon={LuThermometer}
                label="Ressenti"
                value={
                  current?.apparent_temperature != null
                    ? `${Math.round(current.apparent_temperature)}°C`
                    : "—"
                }
              />
              <CurrentMetric
                icon={LuWind}
                label="Vent"
                value={
                  current?.windspeed_10m != null
                    ? `${Math.round(current.windspeed_10m)} km/h`
                    : "—"
                }
              />
              <CurrentMetric
                icon={LuDroplets}
                label="Humidité"
                value={
                  current?.relative_humidity_2m != null
                    ? `${Math.round(current.relative_humidity_2m)}%`
                    : "—"
                }
              />
              <CurrentMetric
                icon={LuSunrise}
                label="Lever"
                iconColor="orange.500"
                value={
                  sunrise
                    ? new Date(sunrise).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"
                }
              />
              <CurrentMetric
                icon={LuSunset}
                label="Coucher"
                iconColor="purple.500"
                value={
                  sunset
                    ? new Date(sunset).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"
                }
              />
            </Grid>
          </>
        )}
      </Grid>

      {/* Hourly forecast strip — each slot carries all metrics (temp, apparent, wind, humidity) */}
      {isLoading ? (
        <Grid templateColumns="repeat(5, 1fr)" gap="2" flex="1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} rounded="lg" minH="24" />
          ))}
        </Grid>
      ) : hourlyForecast.length > 0 ? (
        <Grid templateColumns="repeat(5, minmax(0, 1fr))" gap="2" flex="1">
          {hourlyForecast.map((h, i) => {
            const HIcon = getWeatherIcon(h.code);
            const isNow = i === 0;
            return (
              <Flex
                key={h.time}
                direction="column"
                gap="2"
                p="2.5"
                bg={isNow ? "primary.50" : "bg.subtle"}
                _dark={isNow ? { bg: "primary.900" } : undefined}
                borderWidth="1px"
                borderColor={isNow ? "primary.300" : "border.subtle"}
                rounded="lg"
              >
                <Flex align="center" justify="space-between">
                  <Text
                    fontSize="2xs"
                    fontWeight="700"
                    color={isNow ? "primary.fg" : "fg.muted"}
                    letterSpacing="wider"
                    textTransform="uppercase"
                    fontFamily="mono"
                  >
                    {isNow
                      ? "Maintenant"
                      : new Date(h.time).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                  </Text>
                  <Icon
                    as={HIcon}
                    boxSize="4"
                    color={isNow ? "primary.fg" : "fg.muted"}
                  />
                </Flex>
                <Text
                  fontSize="2xl"
                  fontWeight="900"
                  color="fg"
                  lineHeight="1"
                  fontVariantNumeric="tabular-nums"
                >
                  {Math.round(h.temp)}°
                </Text>
                <VStack align="stretch" gap="0.5">
                  {h.apparent != null && (
                    <HourMetric
                      icon={LuThermometer}
                      label="Ressenti"
                      value={`${Math.round(h.apparent)}°`}
                    />
                  )}
                  {h.wind != null && (
                    <HourMetric
                      icon={LuWind}
                      label="Vent"
                      value={`${Math.round(h.wind)} km/h`}
                    />
                  )}
                  {h.humidity != null && (
                    <HourMetric
                      icon={LuDroplets}
                      label="Humidité"
                      value={`${Math.round(h.humidity)}%`}
                    />
                  )}
                </VStack>
              </Flex>
            );
          })}
        </Grid>
      ) : null}
    </Flex>
  );
}

function CurrentMetric({
  icon: IconComp,
  label,
  value,
  iconColor = "fg.muted",
}: {
  icon: React.ComponentType;
  label: string;
  value: string;
  iconColor?: string;
}) {
  return (
    <HStack
      gap="2"
      p="2"
      bg="bg.subtle"
      borderWidth="1px"
      borderColor="border.subtle"
      rounded="lg"
      minW="0"
    >
      <Icon as={IconComp} boxSize="4" color={iconColor} flexShrink={0} />
      <Box minW="0">
        <Text
          fontSize="2xs"
          color="fg.muted"
          textTransform="uppercase"
          letterSpacing="wider"
          fontWeight="700"
          truncate
        >
          {label}
        </Text>
        <Text fontSize="sm" fontWeight="800" color="fg" truncate>
          {value}
        </Text>
      </Box>
    </HStack>
  );
}

function HourMetric({
  icon: IconComp,
  label,
  value,
}: {
  icon: React.ComponentType;
  label: string;
  value: string;
}) {
  return (
    <HStack gap="1" fontSize="2xs" color="fg.muted" justify="space-between">
      <HStack gap="1" minW="0">
        <Icon as={IconComp} boxSize="3" flexShrink={0} />
        <Text truncate>{label}</Text>
      </HStack>
      <Text fontWeight="700" fontFamily="mono" color="fg" flexShrink={0}>
        {value}
      </Text>
    </HStack>
  );
}
