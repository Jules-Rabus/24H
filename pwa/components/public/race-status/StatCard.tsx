"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
}) {
  return (
    <Flex
      direction="column"
      justify="space-between"
      p="3"
      bg="whiteAlpha.50"
      rounded="xl"
      borderLeftWidth="2px"
      borderLeftColor="primary.500"
      overflow="hidden"
    >
      <Text
        fontSize="xs"
        fontWeight="700"
        letterSpacing="0.12em"
        textTransform="uppercase"
        color="gray.500"
      >
        {label}
      </Text>
      <Box mt="1">
        <Box>{value}</Box>
        {sub && (
          <Text fontSize="xs" color="gray.500" mt="0.5">
            {sub}
          </Text>
        )}
      </Box>
    </Flex>
  );
}
