"use client";

import {
  Badge,
  Box,
  Flex,
  HStack,
  Heading,
  Icon,
  Text,
} from "@chakra-ui/react";
import { TEAL, getWeatherIcon } from "./utils";

type TopBarProps = {
  currentTime: Date | null;
  hasCurrentRun: boolean;
  runIndex: number;
  totalRuns: number;
  currentTemp: number | string;
  currentWeatherCode: number;
};

export function TopBar({
  currentTime,
  hasCurrentRun,
  runIndex,
  totalRuns,
  currentTemp,
  currentWeatherCode,
}: TopBarProps) {
  const WeatherIcon = getWeatherIcon(currentWeatherCode);

  return (
    <Flex
      align="center"
      justify="space-between"
      px="6"
      py="2"
      flexShrink={0}
      borderBottomWidth="1px"
      borderColor="whiteAlpha.100"
      bg="blackAlpha.400"
    >
      <HStack gap="4">
        <Box
          w="2.5"
          h="2.5"
          rounded="full"
          flexShrink={0}
          bg={hasCurrentRun ? "primary.400" : "gray.500"}
          boxShadow={hasCurrentRun ? `0 0 8px ${TEAL}` : undefined}
        />
        <Heading
          size="md"
          fontWeight="900"
          letterSpacing="tighter"
          textTransform="uppercase"
          color="gray.200"
        >
          DÉFI 24H — UniLaSalle Beauvais
        </Heading>
        {hasCurrentRun && (
          <Badge
            colorPalette="primary"
            variant="outline"
            fontSize="xs"
            fontWeight="800"
            letterSpacing="wider"
          >
            RUN {runIndex}/{totalRuns}
          </Badge>
        )}
      </HStack>
      <HStack gap="6">
        <HStack gap="2" color="gray.400">
          <Icon as={WeatherIcon} boxSize="5" />
          <Text fontWeight="700" fontSize="lg">
            {currentTemp}°C
          </Text>
        </HStack>
        <Text
          fontWeight="900"
          fontSize="2xl"
          letterSpacing="tight"
          fontVariantNumeric="tabular-nums"
          color="gray.100"
        >
          {currentTime?.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }) ?? "--:--:--"}
        </Text>
      </HStack>
    </Flex>
  );
}
