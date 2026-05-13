"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Flex,
  Grid,
  HStack,
  IconButton,
  Icon,
  Skeleton,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  LuChevronLeft,
  LuChevronRight,
  LuCloudRain,
  LuDroplets,
  LuSun,
  LuSunrise,
  LuSunset,
  LuThermometer,
  LuWind,
} from "react-icons/lu";
import useEmblaCarousel from "embla-carousel-react";
import type { WeatherResponse } from "@/state/weather/queries";
import { getWeatherIcon } from "./utils";
import { RainNext60 } from "./RainNext60";

type WeatherCarouselMobileProps = {
  isLoading: boolean;
  weatherData: WeatherResponse | undefined;
  now: number;
};

/**
 * Mobile weather panel :
 * - one large card with current conditions (T° + apparent + wind + humidity + sun)
 * - a carousel below with smaller per-hour cards that still surface every metric
 *   (temp, apparent, wind, humidity). Navigation is manual via chevrons — no
 *   auto-rotate.
 */
export function WeatherCarouselMobile({
  isLoading,
  weatherData,
  now,
}: WeatherCarouselMobileProps) {
  const current = weatherData?.current;
  const sunrise = weatherData?.daily?.sunrise?.[0];
  const sunset = weatherData?.daily?.sunset?.[0];
  const WeatherIcon = getWeatherIcon(current?.weather_code ?? 0);

  // Forecast starts at the next full hour after `now` — past hours are dropped
  // so the carousel mirrors the desktop `WeatherPanel` behaviour. Slots past
  // the model horizon come back as null and are filtered out too.
  const hourly =
    weatherData?.hourly.time
      .map((t, i) => ({
        time: t,
        temp: weatherData.hourly.temperature_2m[i],
        code: weatherData.hourly.weather_code[i],
        apparent: weatherData.hourly.apparent_temperature?.[i],
        wind: weatherData.hourly.windspeed_10m?.[i],
        humidity: weatherData.hourly.relative_humidity_2m?.[i],
        rain: weatherData.hourly.rain?.[i],
        uv: weatherData.hourly.uv_index?.[i],
      }))
      .filter((h) => new Date(h.time).getTime() > now && h.temp != null) ?? [];

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    containScroll: "trimSnaps",
  });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateButtons = useCallback(() => {
    if (!emblaApi) return;
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", updateButtons);
    emblaApi.on("reInit", updateButtons);
    // Defer initial sync to the next tick so the effect body stays free of setState.
    const t = setTimeout(updateButtons, 0);
    return () => {
      clearTimeout(t);
      emblaApi.off("select", updateButtons);
      emblaApi.off("reInit", updateButtons);
    };
  }, [emblaApi, updateButtons]);

  if (isLoading) {
    return (
      <VStack align="stretch" gap="3">
        <Skeleton h="36" rounded="2xl" />
        <Skeleton h="28" rounded="2xl" />
      </VStack>
    );
  }

  return (
    <Box
      bg="card.bg"
      borderWidth="1px"
      borderColor="card.border"
      rounded="2xl"
      shadow="sm"
      overflow="hidden"
    >
      {/* Section haute — Météo actuelle (grosse card) */}
      <Box p="4">
        <Flex align="center" justify="space-between" gap="3" mb="3">
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
                fontSize="5xl"
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
          <Flex
            align="center"
            justify="center"
            boxSize="16"
            rounded="2xl"
            bg="primary.50"
            color="primary.fg"
            _dark={{ bg: "primary.900" }}
            flexShrink={0}
          >
            <Icon as={WeatherIcon} boxSize="9" />
          </Flex>
        </Flex>

        <Grid templateColumns="1fr 1fr" gap="2">
          {current?.apparent_temperature != null && (
            <CurrentMetric
              icon={LuThermometer}
              label="Ressenti"
              value={`${Math.round(current.apparent_temperature)}°C`}
            />
          )}
          {current?.windspeed_10m != null && (
            <CurrentMetric
              icon={LuWind}
              label="Vent"
              value={`${Math.round(current.windspeed_10m)} km/h`}
            />
          )}
          {current?.rain != null && (
            <CurrentMetric
              icon={LuCloudRain}
              label="Pluie"
              value={`${current.rain.toFixed(1)} mm`}
            />
          )}
          {current?.uv_index != null && (
            <CurrentMetric
              icon={LuSun}
              label="UV"
              value={current.uv_index.toFixed(1)}
            />
          )}
          {current?.relative_humidity_2m != null && (
            <CurrentMetric
              icon={LuDroplets}
              label="Humidité"
              value={`${Math.round(current.relative_humidity_2m)}%`}
            />
          )}
          {(sunrise || sunset) && (
            <Box
              p="2"
              bg="bg.subtle"
              borderWidth="1px"
              borderColor="border.subtle"
              rounded="lg"
            >
              <Text
                fontSize="2xs"
                color="fg.muted"
                textTransform="uppercase"
                letterSpacing="wider"
                fontWeight="700"
                mb="1"
              >
                Soleil
              </Text>
              <HStack gap="2" align="center">
                {sunrise && (
                  <HStack gap="1" flex="1" minW="0">
                    <Icon
                      as={LuSunrise}
                      boxSize="3.5"
                      color="orange.500"
                      flexShrink={0}
                    />
                    <Text fontSize="xs" fontWeight="800" color="fg" truncate>
                      {new Date(sunrise).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </HStack>
                )}
                {sunset && (
                  <HStack gap="1" flex="1" minW="0">
                    <Icon
                      as={LuSunset}
                      boxSize="3.5"
                      color="purple.500"
                      flexShrink={0}
                    />
                    <Text fontSize="xs" fontWeight="800" color="fg" truncate>
                      {new Date(sunset).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </HStack>
                )}
              </HStack>
            </Box>
          )}
        </Grid>

        <Box mt="3">
          <RainNext60 weatherData={weatherData} now={now} />
        </Box>
      </Box>

      {/* Carousel des prévisions horaires — intégré dans la même card */}
      <Box borderTopWidth="1px" borderColor="card.border" p="3" bg="bg.subtle">
        <Flex align="center" justify="space-between" mb="2" px="1">
          <Text
            fontSize="xs"
            fontWeight="700"
            letterSpacing="0.1em"
            textTransform="uppercase"
            color="fg.muted"
          >
            Prévisions horaires
          </Text>
          <HStack gap="1">
            <IconButton
              aria-label="Heure précédente"
              size="xs"
              variant="ghost"
              onClick={() => emblaApi?.scrollPrev()}
              disabled={!canPrev}
            >
              <LuChevronLeft />
            </IconButton>
            <IconButton
              aria-label="Heure suivante"
              size="xs"
              variant="ghost"
              onClick={() => emblaApi?.scrollNext()}
              disabled={!canNext}
            >
              <LuChevronRight />
            </IconButton>
          </HStack>
        </Flex>

        {hourly.length === 0 ? (
          <Flex
            align="center"
            justify="center"
            py="6"
            color="fg.subtle"
            fontSize="sm"
          >
            Pas de prévisions disponibles
          </Flex>
        ) : (
          <Box
            overflow="hidden"
            ref={emblaRef}
            style={{ touchAction: "pan-y" }}
          >
            <Flex gap="2">
              {hourly.map((h, i) => {
                // `temp` is guaranteed non-null by the filter above; the
                // intermediate `temp` const re-narrows it for TypeScript.
                const temp = h.temp as number;
                const HIcon = getWeatherIcon(h.code ?? 0);
                const t = new Date(h.time);
                const isNext = i === 0;
                return (
                  <Flex
                    key={h.time}
                    flex="0 0 45%"
                    minW="0"
                    direction="column"
                    gap="2"
                    p="2.5"
                    bg={isNext ? "primary.50" : "bg.subtle"}
                    _dark={isNext ? { bg: "primary.900" } : undefined}
                    borderWidth="1px"
                    borderColor={isNext ? "primary.300" : "border.subtle"}
                    rounded="lg"
                  >
                    <Flex align="center" justify="space-between">
                      <Text
                        fontSize="2xs"
                        fontWeight="700"
                        color={isNext ? "primary.fg" : "fg.muted"}
                        letterSpacing="wider"
                        textTransform="uppercase"
                        fontFamily="mono"
                      >
                        {t.toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                      <Icon
                        as={HIcon}
                        boxSize="4"
                        color={isNext ? "primary.fg" : "fg.muted"}
                      />
                    </Flex>
                    <Text
                      fontSize="2xl"
                      fontWeight="900"
                      color="fg"
                      lineHeight="1"
                      fontVariantNumeric="tabular-nums"
                    >
                      {Math.round(temp)}°
                    </Text>
                    <VStack align="stretch" gap="0.5">
                      {h.apparent != null && (
                        <HourMetric
                          icon={LuThermometer}
                          value={`${Math.round(h.apparent)}°`}
                        />
                      )}
                      {h.wind != null && (
                        <HourMetric
                          icon={LuWind}
                          value={`${Math.round(h.wind)} km/h`}
                        />
                      )}
                      {h.humidity != null && (
                        <HourMetric
                          icon={LuDroplets}
                          value={`${Math.round(h.humidity)}%`}
                        />
                      )}
                      {h.rain != null && (
                        <HourMetric
                          icon={LuCloudRain}
                          value={`${h.rain.toFixed(1)} mm`}
                        />
                      )}
                      {h.uv != null && (
                        <HourMetric icon={LuSun} value={h.uv.toFixed(1)} />
                      )}
                    </VStack>
                  </Flex>
                );
              })}
            </Flex>
          </Box>
        )}
      </Box>
    </Box>
  );
}

function CurrentMetric({
  icon: IconComp,
  label,
  value,
}: {
  icon: React.ComponentType;
  label: string;
  value: string;
}) {
  return (
    <HStack
      gap="2"
      p="2"
      bg="bg.subtle"
      borderWidth="1px"
      borderColor="border.subtle"
      rounded="lg"
    >
      <Icon as={IconComp} boxSize="4" color="fg.muted" />
      <Box>
        <Text
          fontSize="2xs"
          color="fg.muted"
          textTransform="uppercase"
          letterSpacing="wider"
          fontWeight="700"
        >
          {label}
        </Text>
        <Text fontSize="sm" fontWeight="800" color="fg">
          {value}
        </Text>
      </Box>
    </HStack>
  );
}

function HourMetric({
  icon: IconComp,
  value,
}: {
  icon: React.ComponentType;
  value: string;
}) {
  return (
    <HStack gap="1.5" fontSize="2xs" color="fg.muted">
      <Icon as={IconComp} boxSize="3" />
      <Text fontWeight="700" fontFamily="mono">
        {value}
      </Text>
    </HStack>
  );
}
