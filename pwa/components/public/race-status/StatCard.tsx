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
      bg="card.bg"
      borderWidth="1px"
      borderColor="card.border"
      rounded="xl"
      shadow="sm"
      overflow="hidden"
    >
      <Text
        fontSize="xs"
        fontWeight="700"
        letterSpacing="0.12em"
        textTransform="uppercase"
        color="fg.muted"
      >
        {label}
      </Text>
      <Box mt="1">
        <Box>{value}</Box>
        {sub && (
          <Text fontSize="xs" color="fg.muted" mt="0.5">
            {sub}
          </Text>
        )}
      </Box>
    </Flex>
  );
}
