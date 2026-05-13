"use client";

import { Box, Flex, HStack, Text } from "@chakra-ui/react";
import { LuCloudRain } from "react-icons/lu";
import type { WeatherResponse } from "@/state/weather/queries";

type RainNext60Props = {
  weatherData: WeatherResponse | undefined;
  now: number;
};

/**
 * Compact 6-bar chart of rainfall (mm) over the next 90 minutes, in 15-min
 * steps. Mirrors the "pluie dans l'heure" widget popular in mobile weather
 * apps. Renders nothing if the API didn't return minutely data (only AROME /
 * France provides it).
 */
export function RainNext60({ weatherData, now }: RainNext60Props) {
  const minutely = weatherData?.minutely_15;
  if (!minutely?.rain || minutely.rain.length === 0) return null;

  // Pick the next 6 slots (= next 90 min) that start after `now`.
  const slots = minutely.time
    .map((t, i) => ({
      time: t,
      ts: new Date(t).getTime(),
      rain: minutely.rain?.[i] ?? null,
    }))
    .filter((s) => s.ts > now && s.rain != null)
    .slice(0, 6);

  if (slots.length === 0) return null;

  const maxMm = Math.max(...slots.map((s) => s.rain ?? 0));
  // Pad the chart axis a little so a 0.1 mm peak isn't a full-height bar.
  const yMax = Math.max(maxMm, 0.5);

  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });

  // Rain intensity bucket (mm per 15-min slot) → bar color + label color.
  // Thresholds aligned with the usual weather scale converted to a 15-min
  // window: light < 0.5 mm (~2 mm/h), moderate < 2 mm (~8 mm/h), heavy otherwise.
  const intensityColor = (mm: number): string => {
    if (mm <= 0) return "transparent";
    if (mm < 0.5) return "blue.300";
    if (mm < 2) return "blue.500";
    return "blue.700";
  };
  const labelColor = (mm: number): string => {
    if (mm <= 0) return "fg.subtle";
    if (mm < 0.5) return "blue.400";
    if (mm < 2) return "blue.600";
    return "blue.800";
  };

  return (
    <Box
      p="3"
      bg="bg.subtle"
      borderWidth="1px"
      borderColor="border.subtle"
      rounded="lg"
    >
      <HStack gap="2" mb="2" align="center">
        <LuCloudRain size={14} />
        <Text
          fontSize="2xs"
          color="fg.muted"
          textTransform="uppercase"
          letterSpacing="wider"
          fontWeight="700"
        >
          Pluie 1h30
        </Text>
      </HStack>

      <Flex align="flex-end" justify="space-between" gap="1" h="10">
        {slots.map((s) => {
          const mm = s.rain ?? 0;
          const heightPct = (mm / yMax) * 100;
          return (
            <Flex
              key={s.time}
              direction="column"
              align="center"
              flex="1"
              gap="0.5"
              h="full"
            >
              <Flex flex="1" align="flex-end" w="full">
                <Box
                  w="full"
                  h={`${heightPct}%`}
                  minH={mm > 0 ? "1px" : 0}
                  bg={intensityColor(mm)}
                  rounded="sm"
                />
              </Flex>
            </Flex>
          );
        })}
      </Flex>

      <Flex justify="space-between" mt="1" gap="1">
        {slots.map((s) => {
          const mm = s.rain ?? 0;
          return (
            <Flex
              key={s.time}
              direction="column"
              align="center"
              flex="1"
              gap="0"
            >
              <Text
                fontSize="2xs"
                color={labelColor(mm)}
                fontWeight="700"
                fontFamily="mono"
                lineHeight="1.1"
              >
                {mm.toFixed(1)}
              </Text>
              <Text
                fontSize="2xs"
                color="fg.muted"
                fontFamily="mono"
                lineHeight="1.1"
              >
                {fmtTime(s.time)}
              </Text>
            </Flex>
          );
        })}
      </Flex>
    </Box>
  );
}
