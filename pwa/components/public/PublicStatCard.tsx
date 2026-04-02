"use client";

import { Box, Card, HStack, Skeleton, Text } from "@chakra-ui/react";
import type { ComponentType } from "react";

interface PublicStatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: ComponentType<{ size?: number }>;
  color?: string;
  delta?: string;
  deltaPositive?: boolean;
  loading?: boolean;
}

export function PublicStatCard({
  label,
  value,
  icon: IconComponent,
  color = "primary.500",
  delta,
  deltaPositive,
  loading,
}: PublicStatCardProps) {
  return (
    <Card.Root
      shadow="sm"
      borderWidth="1px"
      borderColor="card.border"
      bg="card.bg"
    >
      <Card.Body p="3" display="flex" flexDirection="column" gap="1">
        <HStack justify="space-between" align="center" minH="4">
          <Text
            fontSize="2xs"
            textTransform="uppercase"
            letterSpacing="wider"
            fontWeight="semibold"
            color="fg.muted"
            lineHeight="1"
          >
            {label}
          </Text>
          {IconComponent && (
            <Box color={color} flexShrink={0}>
              <IconComponent size={14} />
            </Box>
          )}
        </HStack>

        <Skeleton loading={loading ?? false} minH="6">
          <Text
            fontWeight="extrabold"
            fontSize={{ base: "lg", md: "xl" }}
            color={color}
            lineHeight="tight"
            fontVariantNumeric="tabular-nums"
          >
            {value}
          </Text>
        </Skeleton>

        {delta != null && (
          <Text
            fontSize="2xs"
            color={deltaPositive ? "green.500" : "red.500"}
            fontWeight="semibold"
            lineHeight="1"
            minH="3"
          >
            {deltaPositive ? "↑" : "↓"} {delta}
          </Text>
        )}
      </Card.Body>
    </Card.Root>
  );
}
