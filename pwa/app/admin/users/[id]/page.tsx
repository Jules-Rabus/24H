"use client";

import { use, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Badge,
  Box,
  Button,
  Card,
  Dialog,
  Heading,
  HStack,
  Portal,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useAdminUserQuery, type AdminUser } from "@/state/admin/users/queries";
import {
  useUpdateUserMutation,
  useDeleteUserMutation,
  useUploadUserImageMutation,
} from "@/state/admin/users/mutations";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";

// ---------------------------------------------------------------------------
// UserForm (inline, edit only on this detail page)
// ---------------------------------------------------------------------------

import { Checkbox, Field, Input } from "@chakra-ui/react";

function UserForm({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const updateMutation = useUpdateUserMutation();

  const [form, setForm] = useState({
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    surname: user.surname ?? "",
    email: user.email ?? "",
    organization: user.organization ?? "",
    isAdmin: user.roles?.includes("ROLE_ADMIN") ?? false,
  });

  const isLoading = updateMutation.isPending;

  const handleChange = (field: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const roles: string[] = form.isAdmin
      ? ["ROLE_USER", "ROLE_ADMIN"]
      : ["ROLE_USER"];

    await updateMutation.mutateAsync({
      id: user.id!,
      body: {
        firstName: form.firstName,
        lastName: form.lastName,
        surname: form.surname || null,
        email: form.email || null,
        organization: form.organization || null,
        roles,
      },
    });
    onClose();
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <Dialog.Body>
        <VStack gap="4">
          <Field.Root required>
            <Field.Label>Prénom</Field.Label>
            <Input
              value={form.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              placeholder="Prénom"
              required
            />
          </Field.Root>

          <Field.Root required>
            <Field.Label>Nom</Field.Label>
            <Input
              value={form.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              placeholder="Nom"
              required
            />
          </Field.Root>

          <Field.Root>
            <Field.Label>Surnom</Field.Label>
            <Input
              value={form.surname ?? ""}
              onChange={(e) => handleChange("surname", e.target.value)}
              placeholder="Surnom (optionnel)"
            />
          </Field.Root>

          <Field.Root>
            <Field.Label>Email</Field.Label>
            <Input
              type="email"
              value={form.email ?? ""}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="email@exemple.fr"
            />
          </Field.Root>

          <Field.Root>
            <Field.Label>Organisation</Field.Label>
            <Input
              value={form.organization ?? ""}
              onChange={(e) => handleChange("organization", e.target.value)}
              placeholder="Organisation (optionnel)"
            />
          </Field.Root>

          <Field.Root>
            <HStack gap="3">
              <Checkbox.Root
                checked={form.isAdmin}
                onCheckedChange={({ checked }) =>
                  handleChange("isAdmin", !!checked)
                }
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control />
                <Checkbox.Label>Administrateur</Checkbox.Label>
              </Checkbox.Root>
            </HStack>
          </Field.Root>
        </VStack>
      </Dialog.Body>

      <Dialog.Footer gap="3">
        <Button
          variant="outline"
          onClick={onClose}
          type="button"
          disabled={isLoading}
        >
          Annuler
        </Button>
        <Button type="submit" colorPalette="primary" loading={isLoading}>
          Modifier
        </Button>
      </Dialog.Footer>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Stat Card helper
// ---------------------------------------------------------------------------

function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Card.Root variant="outline" shadow="sm" borderColor="border.subtle">
      <Card.Body p="5">
        <Text
          fontSize="xs"
          color="fg.muted"
          textTransform="uppercase"
          letterSpacing="wider"
          fontWeight="semibold"
          mb="1"
        >
          {label}
        </Text>
        <Text fontSize="2xl" fontWeight="bold">
          {value}
        </Text>
      </Card.Body>
    </Card.Root>
  );
}

// ---------------------------------------------------------------------------
// UserDetailPage
// ---------------------------------------------------------------------------

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const userId = Number(id);
  const router = useRouter();

  const { data: user, isLoading } = useAdminUserQuery(userId);
  const uploadImageMutation = useUploadUserImageMutation();
  const deleteUserMutation = useDeleteUserMutation();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadImageMutation.mutateAsync({ userId, file });
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleConfirmDelete = async () => {
    await deleteUserMutation.mutateAsync(userId);
    router.push("/admin/users");
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py="16">
        <Spinner size="xl" color="primary.500" />
      </Box>
    );
  }

  if (!user) {
    return (
      <VStack gap="4" py="16" align="center">
        <Text color="fg.muted">Utilisateur introuvable.</Text>
        <Link href="/admin/users">
          <Button variant="outline" size="sm">
            ← Retour à la liste
          </Button>
        </Link>
      </VStack>
    );
  }

  const fullName =
    `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "—";
  const isAdmin = user.roles?.includes("ROLE_ADMIN") ?? false;
  const finishedRuns = user.finishedParticipationsCount ?? 0;
  const distance = finishedRuns * 4;

  // Build image URL from IRI: "/api/medias/3" → extract "3" → build URL
  const imageId = user.image?.split("/").at(-1);
  const imageUrl = imageId
    ? `${process.env.NEXT_PUBLIC_ENTRYPOINT ?? ""}/medias/${imageId}/file`
    : null;

  return (
    <VStack align="stretch" gap="6">
      {/* Breadcrumb / back */}
      <HStack>
        <Link href="/admin/users">
          <Button variant="ghost" size="sm" colorPalette="primary">
            ← Utilisateurs
          </Button>
        </Link>
      </HStack>

      {/* Header */}
      <Card.Root variant="outline" shadow="sm" borderColor="border.subtle">
        <Card.Body p="6">
          <HStack
            justify="space-between"
            align="flex-start"
            flexWrap="wrap"
            gap="4"
          >
            <VStack align="flex-start" gap="2">
              <HStack gap="3" align="center">
                <Heading size="xl">{fullName}</Heading>
                <Badge colorPalette={isAdmin ? "purple" : "gray"} size="lg">
                  {isAdmin ? "Admin" : "Utilisateur"}
                </Badge>
              </HStack>
              {user.surname && (
                <Text color="fg.muted" fontSize="sm">
                  Surnom :{" "}
                  <Text as="span" fontWeight="medium" color="fg">
                    {user.surname}
                  </Text>
                </Text>
              )}
              {user.email && (
                <Text color="fg.muted" fontSize="sm">
                  Email :{" "}
                  <Text as="span" fontWeight="medium" color="fg">
                    {user.email}
                  </Text>
                </Text>
              )}
              {user.organization && (
                <Text color="fg.muted" fontSize="sm">
                  Organisation :{" "}
                  <Text as="span" fontWeight="medium" color="fg">
                    {user.organization}
                  </Text>
                </Text>
              )}
              <Text color="fg.muted" fontSize="xs">
                ID : {user.id ?? "—"}
              </Text>
            </VStack>

            <HStack gap="2">
              <Button
                colorPalette="primary"
                variant="outline"
                size="sm"
                onClick={() => setEditOpen(true)}
              >
                ✏️ Modifier
              </Button>
              <Button
                colorPalette="red"
                variant="outline"
                size="sm"
                onClick={() => setDeleteOpen(true)}
              >
                🗑️ Supprimer
              </Button>
            </HStack>
          </HStack>
        </Card.Body>
      </Card.Root>

      {/* Stats */}
      <SimpleGrid columns={{ base: 1, sm: 2 }} gap="4">
        <StatCard label="Runs terminés" value={finishedRuns} />
        <StatCard label="Distance totale" value={`${distance} km`} />
      </SimpleGrid>

      {/* Image section */}
      <Card.Root variant="outline" shadow="sm" borderColor="border.subtle">
        <Card.Body p="6">
          <Text
            fontSize="xs"
            color="fg.muted"
            textTransform="uppercase"
            letterSpacing="wider"
            fontWeight="semibold"
            mb="4"
          >
            Photo de profil
          </Text>

          <HStack gap="6" align="flex-start" flexWrap="wrap">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={`Photo de ${fullName}`}
                style={{
                  width: "120px",
                  height: "120px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  border: "1px solid var(--chakra-colors-border-subtle)",
                }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <Box
                boxSize="120px"
                rounded="lg"
                bg="bg.subtle"
                borderWidth="1px"
                borderColor="border.subtle"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize="3xl">👤</Text>
              </Box>
            )}

            <VStack align="flex-start" gap="2">
              {user.image && (
                <Text fontSize="xs" color="fg.muted">
                  IRI : {user.image}
                </Text>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageUpload}
              />
              <Button
                size="sm"
                variant="outline"
                colorPalette="primary"
                loading={uploadImageMutation.isPending}
                loadingText="Envoi…"
                onClick={() => fileInputRef.current?.click()}
              >
                📷 Changer l'image
              </Button>
            </VStack>
          </HStack>
        </Card.Body>
      </Card.Root>

      {/* Participations */}
      {user.participations && user.participations.length > 0 && (
        <Card.Root variant="outline" shadow="sm" borderColor="border.subtle">
          <Card.Body p="6">
            <Text
              fontSize="xs"
              color="fg.muted"
              textTransform="uppercase"
              letterSpacing="wider"
              fontWeight="semibold"
              mb="4"
            >
              Participations ({user.participations.length})
            </Text>
            <VStack align="stretch" gap="1">
              {user.participations.map((iri) => {
                const partId = iri.split("/").at(-1);
                return (
                  <HStack
                    key={iri}
                    px="3"
                    py="2"
                    rounded="md"
                    bg="bg.subtle"
                    fontSize="sm"
                    justify="space-between"
                  >
                    <Text color="fg.muted" fontFamily="mono" fontSize="xs">
                      {iri}
                    </Text>
                    <Badge colorPalette="gray" size="sm">
                      #{partId}
                    </Badge>
                  </HStack>
                );
              })}
            </VStack>
          </Card.Body>
        </Card.Root>
      )}

      {/* Edit dialog */}
      <Dialog.Root
        open={editOpen}
        onOpenChange={({ open }) => !open && setEditOpen(false)}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="md">
              <Dialog.Header>
                <Dialog.Title>Modifier l'utilisateur</Dialog.Title>
                <Dialog.CloseTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    position="absolute"
                    top="3"
                    right="3"
                    type="button"
                  >
                    ✕
                  </Button>
                </Dialog.CloseTrigger>
              </Dialog.Header>
              <UserForm user={user} onClose={() => setEditOpen(false)} />
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Supprimer l'utilisateur"
        description={`Êtes-vous sûr de vouloir supprimer ${fullName} ? Cette action est irréversible.`}
        loading={deleteUserMutation.isPending}
      />
    </VStack>
  );
}
