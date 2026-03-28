"use client";

import {
  Box,
  Button,
  Flex,
  HStack,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useMe } from "@/state/auth/queries";

const NAV_ITEMS = [
  { href: "/admin/runs", label: "Runs", icon: "🏃" },
  { href: "/admin/participations", label: "Participations", icon: "📋" },
  { href: "/admin/users", label: "Utilisateurs", icon: "👥" },
  { href: "/admin/medias", label: "Médias", icon: "📷" },
];

function Sidebar() {
  const pathname = usePathname();
  return (
    <Box
      as="nav"
      bg="white"
      borderRight="1px solid"
      borderColor="border.subtle"
      w="240px"
      minH="100vh"
      py="6"
      px="3"
      flexShrink={0}
    >
      <VStack align="stretch" gap="1">
        <Box px="3" mb="6">
          <Text fontWeight="bold" fontSize="lg" color="primary.fg">
            24H Race
          </Text>
          <Text fontSize="xs" color="fg.muted">
            Administration
          </Text>
        </Box>

        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{ textDecoration: "none" }}
            >
              <HStack
                px="3"
                py="2"
                rounded="md"
                bg={isActive ? "colorPalette.muted" : "transparent"}
                color={isActive ? "colorPalette.fg" : "fg.muted"}
                colorPalette="primary"
                fontWeight={isActive ? "semibold" : "normal"}
                fontSize="sm"
                _hover={{ bg: "bg.subtle", color: "fg" }}
                transition="all 0.1s"
                gap="3"
              >
                <Text>{item.icon}</Text>
                <Text>{item.label}</Text>
              </HStack>
            </Link>
          );
        })}

        <Box mt="auto" pt="6" px="3">
          <Link href="/" style={{ textDecoration: "none" }}>
            <Text fontSize="xs" color="fg.muted" _hover={{ color: "fg" }}>
              ← Retour au hub
            </Text>
          </Link>
        </Box>
      </VStack>
    </Box>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: me, isLoading, isError } = useMe();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (isError || !me)) {
      router.replace("/login");
    }
  }, [me, isLoading, isError, router]);

  if (isLoading) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="bg.subtle">
        <Spinner size="xl" color="primary.500" />
      </Flex>
    );
  }

  if (!me) return null;

  return (
    <Flex minH="100vh" bg="bg.subtle">
      <Sidebar />
      <Box flex="1" overflow="auto">
        <Box
          as="header"
          bg="white"
          borderBottom="1px solid"
          borderColor="border.subtle"
          px="6"
          py="3"
        >
          <HStack justify="space-between">
            <Text fontSize="sm" color="fg.muted">
              Connecté en tant que{" "}
              <Text as="span" fontWeight="semibold" color="fg">
                {me.firstName} {me.lastName}
              </Text>
            </Text>
            <form action="/logout" method="post">
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                colorPalette="primary"
              >
                Déconnexion
              </Button>
            </form>
          </HStack>
        </Box>
        <Box as="main" p="6">
          {children}
        </Box>
      </Box>
    </Flex>
  );
}
