"use client";

import {
  Avatar,
  Box,
  Button,
  Flex,
  HStack,
  Separator,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  LuLogOut,
  LuTimer,
  LuClipboardList,
  LuUsers,
  LuImage,
  LuSettings,
  LuSun,
  LuMoon,
  LuMonitor,
} from "react-icons/lu";
import { useMe, type Me } from "@/state/auth/queries";
import { useTheme } from "next-themes";
import { ClientOnly, Skeleton } from "@chakra-ui/react";
import { apiClient } from "@/api/client";

const NAV_ITEMS = [
  { href: "/admin/runs", label: "Runs", icon: LuTimer },
  {
    href: "/admin/participations",
    label: "Participations",
    icon: LuClipboardList,
  },
  { href: "/admin/users", label: "Utilisateurs", icon: LuUsers },
  { href: "/admin/medias", label: "Médias", icon: LuImage },
  { href: "/legacy/admin", label: "React Admin", icon: LuSettings },
];

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const modes = [
    { value: "light", icon: LuSun, label: "Clair" },
    { value: "dark", icon: LuMoon, label: "Sombre" },
    { value: "system", icon: LuMonitor, label: "Système" },
  ] as const;

  return (
    <HStack bg="bg.subtle" rounded="md" p="1" gap="0" w="full" justify="center">
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
            flex="1"
            title={m.label}
          >
            <Icon />
          </Button>
        );
      })}
    </HStack>
  );
}

function Sidebar({ me }: { me: Me }) {
  const pathname = usePathname();
  const router = useRouter();

  const initials =
    (me.firstName?.charAt(0) ?? "") + (me.lastName?.charAt(0) ?? "");

  const handleLogout = async () => {
    await apiClient.post("/logout").catch(() => {});
    router.replace("/login");
  };

  return (
    <Flex
      as="nav"
      direction="column"
      bg="sidebar.bg"
      borderRight="2px solid"
      borderColor="card.border"
      shadow="md"
      w="260px"
      h="100vh"
      position="sticky"
      top={0}
      py="5"
      px="3"
      flexShrink={0}
      overflowY="auto"
    >
      <Box px="3" mb="6">
        <Text fontWeight="bold" fontSize="lg" color="primary.fg">
          24H Race
        </Text>
        <Text fontSize="xs" color="fg.muted">
          Administration
        </Text>
      </Box>

      <VStack align="stretch" gap="1" flex="1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
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
                bg={isActive ? "sidebar.active" : "transparent"}
                color={isActive ? "primary.fg" : "fg.muted"}
                borderLeft={isActive ? "3px solid" : "3px solid transparent"}
                borderColor={isActive ? "sidebar.activeBorder" : "transparent"}
                fontWeight={isActive ? "semibold" : "normal"}
                fontSize="sm"
                _hover={{ bg: "bg.subtle", color: "fg" }}
                transition="all 0.15s"
                gap="3"
              >
                <Icon />
                <Text>{item.label}</Text>
              </HStack>
            </Link>
          );
        })}

        <Box pt="4" px="3">
          <Link href="/" style={{ textDecoration: "none" }}>
            <Text fontSize="xs" color="fg.muted" _hover={{ color: "fg" }}>
              ← Retour au hub
            </Text>
          </Link>
        </Box>
      </VStack>

      <Separator />

      <Box pt="4" px="1">
        <HStack gap="3" px="2" mb="3">
          <Avatar.Root size="sm" colorPalette="primary">
            {me.image ? <Avatar.Image src={me.image} alt={initials} /> : null}
            <Avatar.Fallback>{initials}</Avatar.Fallback>
          </Avatar.Root>
          <Box flex="1" minW="0">
            <Text fontSize="sm" fontWeight="semibold" truncate>
              {me.firstName} {me.lastName}
            </Text>
            <Text fontSize="xs" color="fg.muted" truncate>
              {me.email}
            </Text>
          </Box>
        </HStack>

        <VStack gap="3" px="2">
          <ClientOnly fallback={<Skeleton height="8" w="full" rounded="md" />}>
            <ThemeSwitcher />
          </ClientOnly>
          <Button
            variant="ghost"
            size="sm"
            w="full"
            color="fg.muted"
            _hover={{ color: "fg", bg: "bg.subtle" }}
            onClick={handleLogout}
          >
            <LuLogOut />
            Déconnexion
          </Button>
        </VStack>
      </Box>
    </Flex>
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
      <Sidebar me={me} />
      <Box flex="1" overflow="auto" as="main" p="6" pb="12">
        {children}
      </Box>
    </Flex>
  );
}
