"use client";

import { Suspense } from "react";
import { Box, Flex } from "@chakra-ui/react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { IconType } from "react-icons";
import {
  LuHouse,
  LuTrophy,
  LuActivity,
  LuImages,
  LuUpload,
} from "react-icons/lu";

type Tab = {
  href: string;
  label: string;
  icon: IconType;
  exact?: boolean;
};

const TABS: Tab[] = [
  { href: "/", label: "Accueil", icon: LuHouse, exact: true },
  { href: "/classement", label: "Classement", icon: LuTrophy },
  { href: "/course", label: "Course", icon: LuActivity },
  { href: "/gallery", label: "Galerie", icon: LuImages },
  { href: "/upload", label: "Upload", icon: LuUpload },
];

function PublicBottomBarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qs = searchParams.toString();
  const query = qs ? `?${qs}` : "";

  return (
    <Box
      as="nav"
      display={{ base: "block", md: "none" }}
      position="fixed"
      bottom="0"
      left="0"
      right="0"
      zIndex="sticky"
      bg="card.bg"
      borderTop="1px solid"
      borderColor="card.border"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      shadow="lg"
    >
      <Flex>
        {TABS.map((tab) => {
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={`${tab.href}${query}`}
              style={{ textDecoration: "none", flex: 1 }}
            >
              <Flex
                direction="column"
                align="center"
                justify="center"
                gap="0.5"
                py="2"
                minH="11"
                position="relative"
                fontSize="2xs"
                fontWeight={isActive ? "bold" : "semibold"}
                letterSpacing="wider"
                textTransform="uppercase"
                color={isActive ? "primary.fg" : "fg.muted"}
                overflow="hidden"
              >
                {isActive && (
                  <Box
                    position="absolute"
                    top="0"
                    left="50%"
                    transform="translateX(-50%)"
                    w="7"
                    h="0.5"
                    bg="primary.500"
                    roundedBottom="full"
                  />
                )}
                <Icon size={20} />
                {tab.label}
              </Flex>
            </Link>
          );
        })}
      </Flex>
    </Box>
  );
}

export function PublicBottomBar() {
  return (
    <Suspense>
      <PublicBottomBarContent />
    </Suspense>
  );
}

/** Spacer to ensure scrollable content isn't hidden under the fixed bottom bar on mobile. */
export function PublicBottomBarSpacer() {
  return (
    <Box
      display={{ base: "block", md: "none" }}
      h="14"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      flexShrink={0}
    />
  );
}
