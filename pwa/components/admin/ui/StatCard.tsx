"use client";

import { Box, Card, HStack, Skeleton, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";
import type { ComponentType } from "react";

const MotionCard = motion.create(Card.Root);

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon: ComponentType<{ size?: number }>;
  color?: string;
  trend?: number;
  loading?: boolean;
  index?: number;
}

export function StatCard({
  label,
  value,
  icon: IconComponent,
  color = "primary.500",
  trend,
  loading,
  index = 0,
}: StatCardProps) {
  return (
    <MotionCard
      shadow="sm"
      borderWidth="1px"
      borderColor="card.border"
      bg="card.bg"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
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
    </MotionCard>
  );
}
