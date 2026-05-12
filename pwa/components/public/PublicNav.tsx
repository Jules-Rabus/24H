"use client";

import { Suspense } from "react";
import {
  Box,
  Button,
  ClientOnly,
  Flex,
  HStack,
  Separator,
  Skeleton,
  Text,
} from "@chakra-ui/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import {
  LuHouse,
  LuTrophy,
  LuImages,
  LuUpload,
  LuActivity,
  LuSun,
  LuMoon,
  LuMonitor,
} from "react-icons/lu";
import { useTheme } from "next-themes";
import { PublicBottomBar } from "./PublicBottomBar";

const TABS = [
  { href: "/", label: "Accueil", icon: LuHouse, exact: true },
  { href: "/classement", label: "Classement", icon: LuTrophy },
  { href: "/course", label: "Course", icon: LuActivity },
  { href: "/gallery", label: "Galerie", icon: LuImages },
  { href: "/upload", label: "Upload", icon: LuUpload },
];

const EDITIONS = [2026, 2025] as const;

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const modes = [
    { value: "light", icon: LuSun, label: "Clair" },
    { value: "dark", icon: LuMoon, label: "Sombre" },
    { value: "system", icon: LuMonitor, label: "Système" },
  ] as const;

  return (
    <HStack gap="0">
      {modes.map((m) => {
        const Icon = m.icon;
        const isActive = theme === m.value;
        return (
          <Button
            key={m.value}
            size="xs"
            variant={isActive ? "solid" : "ghost"}
            colorPalette={isActive ? "primary" : undefined}
            onClick={() => setTheme(m.value)}
            title={m.label}
            px="2"
          >
            <Icon />
          </Button>
        );
      })}
    </HStack>
  );
}

function PublicNavContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentEdition = Number(searchParams.get("edition")) || EDITIONS[0];

  const switchEdition = (edition: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("edition", String(edition));
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <>
      <Box
        as="header"
        position="sticky"
        top="0"
        zIndex="sticky"
        bg="card.bg"
        borderBottom="1px solid"
        borderColor="card.border"
        shadow="sm"
      >
        {/* Logo row */}
        <Flex
          maxW="6xl"
          mx="auto"
          px="4"
          pt="3"
          pb={{ base: "3", md: "2" }}
          align="center"
          justify="space-between"
        >
          <Link href="/" style={{ textDecoration: "none" }}>
            <HStack gap="2">
              <Image
                src="/logo.png"
                alt="Défi des 24h"
                width={28}
                height={28}
              />
              <Text fontWeight="extrabold" fontSize="lg" color="primary.fg">
                Défi des 24h
              </Text>
            </HStack>
          </Link>

          <HStack gap="2">
            {/* Edition pills */}
            <HStack bg="bg.subtle" rounded="full" p="0.5" gap="0.5">
              {EDITIONS.map((ed) => (
                <Button
                  key={ed}
                  size="xs"
                  rounded="full"
                  variant={currentEdition === ed ? "solid" : "ghost"}
                  colorPalette={currentEdition === ed ? "primary" : undefined}
                  onClick={() => switchEdition(ed)}
                  fontWeight="bold"
                  fontSize="xs"
                  px="3"
                >
                  {ed}
                </Button>
              ))}
            </HStack>
            <ClientOnly fallback={<Skeleton h="6" w="14" />}>
              <ThemeSwitcher />
            </ClientOnly>
          </HStack>
        </Flex>

        {/* Desktop tab bar (hidden on mobile — bottom bar takes over) */}
        <Flex
          maxW="6xl"
          mx="auto"
          px="4"
          align="center"
          borderTop="1px solid"
          borderColor="border.subtle"
          display={{ base: "none", md: "flex" }}
        >
          {TABS.map((tab) => {
            const isActive = tab.exact
              ? pathname === tab.href
              : pathname.startsWith(tab.href);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={`${tab.href}?edition=${currentEdition}`}
                style={{ textDecoration: "none", flex: 1 }}
              >
                <Flex
                  align="center"
                  justify="center"
                  gap="1"
                  py="2"
                  fontSize="xs"
                  fontWeight={isActive ? "bold" : "medium"}
                  color={isActive ? "primary.fg" : "fg.muted"}
                  borderBottom="2px solid"
                  borderColor={isActive ? "primary.500" : "transparent"}
                >
                  <Icon size={14} />
                  {tab.label}
                </Flex>
              </Link>
            );
          })}

          <Separator
            orientation="vertical"
            mx="2"
            h="5"
            borderColor="border.subtle"
          />
        </Flex>
      </Box>

      <PublicBottomBar />
    </>
  );
}

export function PublicNav() {
  return (
    <Suspense>
      <PublicNavContent />
    </Suspense>
  );
}
