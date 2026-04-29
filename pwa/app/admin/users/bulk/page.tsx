"use client";

import { useRouter } from "next/navigation";
import { Box, Heading, Text, VStack } from "@chakra-ui/react";
import { BulkUserForm } from "@/components/admin/BulkUserForm";

export default function BulkUsersPage() {
  const router = useRouter();
  const back = () => router.push("/admin/users");

  return (
    <VStack align="stretch" gap="6" p={{ base: "4", md: "6" }}>
      <Box>
        <Heading size="lg">Saisie en masse d&apos;utilisateurs</Heading>
        <Text color="fg.muted" fontSize="sm" mt="1">
          Créer plusieurs coureurs à la fois et leur associer une photo.
        </Text>
      </Box>
      <BulkUserForm onClose={back} />
    </VStack>
  );
}
