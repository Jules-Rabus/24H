"use client";

import { Box, Button, Flex, HStack, Text } from "@chakra-ui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LuTrophy, LuImage, LuTimer } from "react-icons/lu";
import { ColorModeButton } from "../ui/color-mode";

const NAV_LINKS = [
  { href: "/classement", label: "Classement", icon: LuTrophy },
  { href: "/gallery", label: "Galerie", icon: LuImage },
];

export function PublicNav() {
  const pathname = usePathname();

  return (
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
      <Flex
        maxW="6xl"
        mx="auto"
        px="4"
        py="3"
        align="center"
        justify="space-between"
      >
        <Link href="/classement" style={{ textDecoration: "none" }}>
          <HStack gap="2">
            <LuTimer size={20} />
            <Text fontWeight="extrabold" fontSize="lg" color="primary.fg">
              24H Race
            </Text>
          </HStack>
        </Link>

        <HStack gap="1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{ textDecoration: "none" }}
              >
                <Button
                  size="sm"
                  variant={isActive ? "subtle" : "ghost"}
                  colorPalette={isActive ? "primary" : undefined}
                >
                  <Icon />
                  {link.label}
                </Button>
              </Link>
            );
          })}
          <ColorModeButton />
        </HStack>
      </Flex>
    </Box>
  );
}
