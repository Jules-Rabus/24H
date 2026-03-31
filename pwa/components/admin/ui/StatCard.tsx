"use client";

import { Box, Card, HStack, Skeleton, Text } from "@chakra-ui/react";
import type { ComponentType } from "react";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon: ComponentType<{ size?: number }>;
  color?: string;
  trend?: number;
  loading?: boolean;
}

export function StatCard({
  label,
  value,
  icon: IconComponent,
  color = "primary.500",
  trend,
  loading,
}: StatCardProps) {
  return (
    <Card.Root
      shadow="sm"
      borderWidth="1px"
      borderColor="card.border"
      bg="card.bg"
    >
      <Card.Body p="5">
        <HStack justify="space-between" align="start" mb="3">
          <Text
            fontSize="xs"
            textTransform="uppercase"
            letterSpacing="wider"
            fontWeight="semibold"
            color="fg.muted"
          >
            {label}
          </Text>
          <Box color={color} flexShrink={0}>
            <IconComponent size={18} />
          </Box>
        </HStack>

        <Skeleton loading={loading ?? false} height="8" width="60%">
          <Text
            fontSize="2xl"
            fontWeight="extrabold"
            letterSpacing="tight"
            fontVariantNumeric="tabular-nums"
          >
            {value}
          </Text>
        </Skeleton>

        {trend !== undefined && (
          <Text
            fontSize="xs"
            mt="1"
            color={trend >= 0 ? "stat.green" : "stat.red"}
            fontWeight="medium"
          >
            {trend >= 0 ? "+" : ""}
            {trend}%
          </Text>
        )}
      </Card.Body>
    </Card.Root>
  );
}
