"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import {
  LuPersonStanding,
  LuSettings2,
  LuZap,
  LuChevronRight,
  LuHeartHandshake,
} from "react-icons/lu";

export function HomePage() {
  const router = useRouter();

  return (
    <Box minH="100svh" bg="bg.subtle" display="flex" flexDirection="column">
      {/* Header */}
      <Box bg="#0f929a" py="5" px="4" textAlign="center">
        <VStack gap="2">
          <HStack gap="4" align="center" justify="center">
            <Box
              rounded="2xl"
              overflow="hidden"
              boxShadow="md"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Image
                src="/logo.png"
                alt="Défi des 24h"
                width={112}
                height={112}
                priority
                style={{ display: "block" }}
              />
            </Box>
            <Box
              rounded="2xl"
              overflow="hidden"
              boxShadow="md"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Image
                src="/ASPO.jpeg"
                alt="ASPO — Association Sportive des Policiers de l'Oise"
                width={112}
                height={112}
                priority
                style={{ display: "block" }}
              />
            </Box>
          </HStack>
          <Text
            fontWeight="extrabold"
            fontSize="2xl"
            color="white"
            letterSpacing="widest"
            textTransform="uppercase"
          >
            Défi des 24h
          </Text>
        </VStack>
        <Text color="cyan.100" fontSize="md">
          Bienvenue
        </Text>
        <Text color="cyan.100" fontSize="sm" mt="1" fontWeight="600">
          Organisé par l&apos;ASPO
        </Text>
        <Text color="cyan.100" fontSize="2xs" opacity={0.8}>
          Association Sportive des Policiers de l&apos;Oise
        </Text>
      </Box>

      {/* Buttons */}
      <VStack
        flex="1"
        justify="center"
        px="6"
        gap="3"
        py="6"
        maxW="sm"
        mx="auto"
        w="full"
      >
        {/* Participant */}
        <Box
          as="button"
          w="full"
          bg="primary.500"
          _hover={{ bg: "primary.600" }}
          rounded="2xl"
          px="5"
          py="5"
          cursor="pointer"
          transition="background 0.15s"
          onClick={() => router.push("/classement")}
        >
          <HStack gap="4" align="center">
            <Box bg="whiteAlpha.200" rounded="xl" p="3" flexShrink={0}>
              <LuPersonStanding size={24} color="white" />
            </Box>
            <VStack align="flex-start" gap="0" flex="1">
              <Text fontWeight="bold" fontSize="lg" color="white">
                Participant
              </Text>
              <Text fontSize="sm" color="whiteAlpha.800">
                Classement · Dossard
              </Text>
            </VStack>
            <LuChevronRight size={20} color="white" />
          </HStack>
        </Box>

        {/* Organisateur */}
        <Box
          as="button"
          w="full"
          bg="card.bg"
          borderWidth="1px"
          borderColor="card.border"
          _hover={{ bg: "bg.muted" }}
          rounded="2xl"
          px="5"
          py="5"
          cursor="pointer"
          transition="background 0.15s"
          onClick={() => router.push("/admin")}
        >
          <HStack gap="4" align="center">
            <Box
              bg="primary.100"
              _dark={{ bg: "primary.900" }}
              rounded="xl"
              p="3"
              flexShrink={0}
            >
              <LuSettings2 size={24} color="#0f929a" />
            </Box>
            <VStack align="flex-start" gap="0" flex="1">
              <Text fontWeight="bold" fontSize="lg" color="fg">
                Organisateur
              </Text>
              <Text fontSize="sm" color="fg.muted">
                Admin · Scanner
              </Text>
            </VStack>
            <LuChevronRight size={20} color="currentColor" />
          </HStack>
        </Box>
      </VStack>

      {/* Soutenir l'association — HelloAsso */}
      <Box px="6" pb="8" maxW="sm" mx="auto" w="full">
        <Box
          as="a"
          {...{
            href: "https://www.helloasso.com/associations/association-sportive-des-policiers-de-l-oise/formulaires/4",
            target: "_blank",
            rel: "noopener noreferrer",
          }}
          display="block"
          w="full"
          bg="card.bg"
          borderWidth="1px"
          borderColor="card.border"
          _hover={{ bg: "bg.muted" }}
          rounded="2xl"
          px="5"
          py="5"
          cursor="pointer"
          transition="background 0.15s"
          textDecoration="none"
        >
          <HStack gap="4" align="center">
            <Box
              bg="pink.100"
              _dark={{ bg: "pink.900" }}
              rounded="xl"
              p="3"
              flexShrink={0}
            >
              <LuHeartHandshake size={24} color="#db2777" />
            </Box>
            <VStack align="flex-start" gap="0" flex="1">
              <Text fontWeight="bold" fontSize="lg" color="fg">
                Soutenir
              </Text>
              <Text fontSize="sm" color="fg.muted">
                Faire un don pour Chloé, Ethan et Gael
              </Text>
            </VStack>
            <LuChevronRight size={20} color="currentColor" />
          </HStack>
        </Box>
      </Box>

      {/* Footer */}
      <Box py="6" textAlign="center">
        <HStack justify="center" gap="1">
          <LuZap size={14} color="#0f929a" />
          <Text fontSize="xs" color="fg.muted">
            Défi des 24h
          </Text>
        </HStack>
      </Box>
    </Box>
  );
}
