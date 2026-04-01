"use client";

import {
  Box,
  Flex,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { LuPersonStanding, LuSettings2, LuChevronRight } from "react-icons/lu";

export default function HomePage() {
  const router = useRouter();

  return (
    <Flex direction="column" minH="100vh">
      {/* Header */}
      <Box bg="primary.500" py="10" textAlign="center">
        <Text
          fontWeight="black"
          fontSize="3xl"
          color="white"
          letterSpacing="widest"
          textTransform="uppercase"
        >
          24H Race
        </Text>
        <Text color="whiteAlpha.700" fontSize="sm" mt="1">
          Bienvenue
        </Text>
      </Box>

      {/* Body */}
      <Flex flex="1" bg="bg.subtle" p="6" direction="column" gap="4" justify="center">
        {/* Bouton Participant */}
        <Box
          as="button"
          bg="primary.500"
          borderRadius="xl"
          px="5"
          py="6"
          onClick={() => router.push("/classement")}
          boxShadow="0 4px 14px rgba(15,146,154,0.35)"
          _hover={{ bg: "primary.600" }}
          transition="background 0.15s"
          cursor="pointer"
          w="full"
        >
          <HStack gap="4">
            <Flex
              w="11"
              h="11"
              bg="whiteAlpha.300"
              borderRadius="lg"
              align="center"
              justify="center"
              flexShrink={0}
            >
              <LuPersonStanding size={22} color="white" />
            </Flex>
            <VStack align="start" gap="0" flex="1">
              <Text color="white" fontWeight="bold" fontSize="lg">
                Participant
              </Text>
              <Text color="whiteAlpha.700" fontSize="sm">
                Classement · Dossard
              </Text>
            </VStack>
            <LuChevronRight size={20} color="rgba(255,255,255,0.5)" />
          </HStack>
        </Box>

        {/* Bouton Organisateur */}
        <Box
          as="button"
          bg="white"
          borderRadius="xl"
          px="5"
          py="6"
          border="2px solid"
          borderColor="border.subtle"
          onClick={() => router.push("/admin")}
          _hover={{ bg: "bg.muted" }}
          transition="background 0.15s"
          cursor="pointer"
          w="full"
        >
          <HStack gap="4">
            <Flex
              w="11"
              h="11"
              bg="primary.100"
              borderRadius="lg"
              align="center"
              justify="center"
              flexShrink={0}
            >
              <LuSettings2 size={22} color="#0f929a" />
            </Flex>
            <VStack align="start" gap="0" flex="1">
              <Text color="fg" fontWeight="bold" fontSize="lg">
                Organisateur
              </Text>
              <Text color="fg.muted" fontSize="sm">
                Admin · Scanner
              </Text>
            </VStack>
            <LuChevronRight size={20} color="var(--chakra-colors-border-subtle)" />
          </HStack>
        </Box>
      </Flex>
    </Flex>
  );
}
