"use client";

import dynamic from "next/dynamic";
import { Box, Flex, Text, Spinner } from "@chakra-ui/react";

const ScannerComponent = dynamic(() => import("./_scanner"), {
  ssr: false,
  loading: () => (
    <Flex align="center" justify="center" h="full" gap="3" color="gray.400">
      <Spinner size="md" />
      <Text fontSize="sm">Initialisation caméra...</Text>
    </Flex>
  ),
});

export default function ScannerPage() {
  return (
    <Box w="100vw" h="100vh" overflow="hidden" bg="gray.950" colorPalette="primary">
      <ScannerComponent />
    </Box>
  );
}
