"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Badge,
  Box,
  Button,
  Checkbox,
  Dialog,
  Field,
  Heading,
  HStack,
  IconButton,
  Input,
  Portal,
  Text,
  VStack,
} from "@chakra-ui/react";
import { LuEye, LuPencil, LuTrash2, LuX } from "react-icons/lu";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import {
  useAdminUsersQuery,
  type AdminUser,
  type UserFilters,
} from "@/state/admin/users/queries";
import { useDebounce } from "@/hooks/useDebounce";
import { type SortState } from "@/components/admin/ui/DataTable";
import {
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "@/state/admin/users/mutations";
import { DataTable, type Column } from "@/components/admin/ui/DataTable";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";

const BulkBibDownloadButton = dynamic(
  () => import("@/components/classement/BulkBibDownloadButton"),
  { ssr: false },
);

// ---------------------------------------------------------------------------
// UserForm — used for both create and edit
// ---------------------------------------------------------------------------

function UserForm({
  user,
  onClose,
}: {
  user?: AdminUser;
  onClose: () => void;
}) {
  const createMutation = useCreateUserMutation();
  const updateMutation = useUpdateUserMutation();

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const form = useForm({
    defaultValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      surname: user?.surname ?? "",
      email: user?.email ?? "",
      plainPassword: "",
      organization: user?.organization ?? "",
      isAdmin: user?.roles?.includes("ROLE_ADMIN") ?? false,
    },
    onSubmit: async ({ value }) => {
      const roles: string[] = value.isAdmin
        ? ["ROLE_USER", "ROLE_ADMIN"]
        : ["ROLE_USER"];

      const body = {
        firstName: value.firstName,
        lastName: value.lastName,
        surname: value.surname || null,
        email: value.email || null,
        organization: value.organization || null,
        roles,
        ...(value.plainPassword ? { plainPassword: value.plainPassword } : {}),
      };

      if (user?.id) {
        await updateMutation.mutateAsync({ id: user.id, body });
      } else {
        await createMutation.mutateAsync({
          ...body,
          plainPassword: value.plainPassword || null,
        });
      }
      onClose();
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <Dialog.Body>
        <VStack gap="4">
          <form.Field
            name="firstName"
            validators={{
              onChange: ({ value }) => {
                const r = z.string().min(1, "Prénom requis").safeParse(value);
                return r.success ? undefined : r.error.issues[0].message;
              },
            }}
          >
            {(field) => (
              <Field.Root required invalid={!!field.state.meta.errors.length}>
                <Field.Label>Prénom</Field.Label>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Prénom"
                />
                <Field.ErrorText>{field.state.meta.errors[0]}</Field.ErrorText>
              </Field.Root>
            )}
          </form.Field>

          <form.Field
            name="lastName"
            validators={{
              onChange: ({ value }) => {
                const r = z.string().min(1, "Nom requis").safeParse(value);
                return r.success ? undefined : r.error.issues[0].message;
              },
            }}
          >
            {(field) => (
              <Field.Root required invalid={!!field.state.meta.errors.length}>
                <Field.Label>Nom</Field.Label>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Nom"
                />
                <Field.ErrorText>{field.state.meta.errors[0]}</Field.ErrorText>
              </Field.Root>
            )}
          </form.Field>

          <form.Field name="surname">
            {(field) => (
              <Field.Root>
                <Field.Label>Surnom</Field.Label>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Surnom (optionnel)"
                />
              </Field.Root>
            )}
          </form.Field>

          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) => {
                if (!value) return undefined;
                const r = z.string().email("Email invalide").safeParse(value);
                return r.success ? undefined : r.error.issues[0].message;
              },
            }}
          >
            {(field) => (
              <Field.Root invalid={!!field.state.meta.errors.length}>
                <Field.Label>Email</Field.Label>
                <Input
                  type="email"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="email@exemple.fr"
                />
                <Field.ErrorText>{field.state.meta.errors[0]}</Field.ErrorText>
              </Field.Root>
            )}
          </form.Field>

          <form.Field name="plainPassword">
            {(field) => (
              <Field.Root>
                <Field.Label>
                  {user ? "Nouveau mot de passe" : "Mot de passe"}
                </Field.Label>
                <Input
                  type="password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={
                    user ? "Laisser vide pour ne pas changer" : "Mot de passe"
                  }
                />
              </Field.Root>
            )}
          </form.Field>

          <form.Field name="organization">
            {(field) => (
              <Field.Root>
                <Field.Label>Organisation</Field.Label>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Organisation (optionnel)"
                />
              </Field.Root>
            )}
          </form.Field>

          <form.Field name="isAdmin">
            {(field) => (
              <Field.Root>
                <HStack gap="3">
                  <Checkbox.Root
                    checked={field.state.value}
                    onCheckedChange={({ checked }) =>
                      field.handleChange(!!checked)
                    }
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                    <Checkbox.Label>Administrateur</Checkbox.Label>
                  </Checkbox.Root>
                </HStack>
              </Field.Root>
            )}
          </form.Field>
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
          {user ? "Modifier" : "Créer"}
        </Button>
      </Dialog.Footer>
    </form>
  );
}

// ---------------------------------------------------------------------------
// AdminUsersPage
// ---------------------------------------------------------------------------

const ITEMS_PER_PAGE = 30;

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(
    new Set(),
  );
  const [search, setSearch] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dossard: "",
  });
  const [sort, setSort] = useState<SortState>({
    field: "lastName",
    dir: "asc",
  });

  const debouncedSearch = useDebounce(search, 300);

  const filters: UserFilters = {
    page,
    itemsPerPage: ITEMS_PER_PAGE,
    firstName: debouncedSearch.firstName || undefined,
    lastName: debouncedSearch.lastName || undefined,
    email: debouncedSearch.email || undefined,
    id: debouncedSearch.dossard ? Number(debouncedSearch.dossard) : undefined,
    orderField: sort.field,
    orderDir: sort.dir,
  };

  const { data, isLoading } = useAdminUsersQuery(filters);

  const [formOpen, setFormOpen] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | undefined>(undefined);
  const [deleteUser, setDeleteUser] = useState<AdminUser | undefined>(
    undefined,
  );

  const deleteMutation = useDeleteUserMutation();

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditUser(undefined);
  };

  const handleConfirmDelete = async () => {
    if (deleteUser?.id) {
      await deleteMutation.mutateAsync(deleteUser.id);
    }
    setDeleteUser(undefined);
  };

  const columns: Column<AdminUser>[] = [
    {
      key: "id",
      header: "#",
      render: (u) => u.id ?? "-",
      width: "60px",
      sortField: "id",
    },
    {
      key: "name",
      header: "Nom",
      render: (u) => `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || "-",
      sortField: "lastName",
    },
    {
      key: "surname",
      header: "Surnom",
      render: (u) => u.surname ?? "-",
      sortField: "surname",
    },
    {
      key: "email",
      header: "Email",
      render: (u) => u.email ?? "-",
      sortField: "email",
    },
    {
      key: "org",
      header: "Organisation",
      render: (u) => u.organization ?? "-",
      sortField: "organization",
    },
    {
      key: "roles",
      header: "Rôle",
      width: "110px",
      render: (u) =>
        u.roles?.includes("ROLE_ADMIN") ? (
          <Badge colorPalette="purple">Admin</Badge>
        ) : (
          <Badge colorPalette="gray">Utilisateur</Badge>
        ),
    },
    {
      key: "runs",
      header: "Runs",
      render: (u) => u.finishedParticipationsCount ?? 0,
      width: "80px",
      sortField: "finishedParticipationsCount",
    },
    {
      key: "dist",
      header: "Distance",
      render: (u) => `${(u.finishedParticipationsCount ?? 0) * 4} km`,
      width: "100px",
    },
    {
      key: "actions",
      header: "",
      width: "120px",
      render: (u) => (
        <HStack gap="1">
          <Link href={`/admin/users/${u.id}`}>
            <IconButton size="sm" variant="ghost" aria-label="Détail">
              <LuEye />
            </IconButton>
          </Link>
          <IconButton
            size="sm"
            variant="ghost"
            aria-label="Modifier"
            onClick={() => {
              setEditUser(u);
              setFormOpen(true);
            }}
          >
            <LuPencil />
          </IconButton>
          <IconButton
            size="sm"
            variant="ghost"
            colorPalette="red"
            aria-label="Supprimer"
            onClick={() => setDeleteUser(u)}
          >
            <LuTrash2 />
          </IconButton>
        </HStack>
      ),
    },
  ];

  return (
    <VStack align="stretch" gap="6">
      {/* Page header */}
      <HStack justify="space-between" align="center" flexWrap="wrap" gap="3">
        <Heading size="lg">Utilisateurs</Heading>
        <HStack gap="2">
          {selectedIds.size > 0 && (
            <BulkBibDownloadButton
              users={(data?.member ?? [])
                .filter(
                  (u) =>
                    u.id != null &&
                    selectedIds.has(u.id) &&
                    u.firstName &&
                    u.lastName,
                )
                .map((u) => ({
                  id: u.id!,
                  firstName: u.firstName!,
                  lastName: u.lastName!,
                  surname: u.surname,
                }))}
            />
          )}
          <Button
            colorPalette="primary"
            onClick={() => {
              setEditUser(undefined);
              setFormOpen(true);
            }}
          >
            + Créer un utilisateur
          </Button>
        </HStack>
      </HStack>

      {/* Search bar — debounced, no submit button */}
      <Box
        bg="bg.panel"
        borderWidth="1px"
        borderColor="border.subtle"
        rounded="lg"
        p="4"
      >
        <HStack gap="3" flexWrap="wrap">
          <Field.Root flex="1" minW="120px">
            <Field.Label fontSize="sm">Dossard</Field.Label>
            <Input
              size="sm"
              placeholder="N°…"
              value={search.dossard}
              onChange={(e) =>
                setSearch((s) => ({ ...s, dossard: e.target.value }))
              }
            />
          </Field.Root>

          <Field.Root flex="1" minW="160px">
            <Field.Label fontSize="sm">Prénom</Field.Label>
            <Input
              size="sm"
              placeholder="Prénom…"
              value={search.firstName}
              onChange={(e) =>
                setSearch((s) => ({ ...s, firstName: e.target.value }))
              }
            />
          </Field.Root>

          <Field.Root flex="1" minW="160px">
            <Field.Label fontSize="sm">Nom</Field.Label>
            <Input
              size="sm"
              placeholder="Nom…"
              value={search.lastName}
              onChange={(e) =>
                setSearch((s) => ({ ...s, lastName: e.target.value }))
              }
            />
          </Field.Root>

          <Field.Root flex="1" minW="200px">
            <Field.Label fontSize="sm">Email</Field.Label>
            <Input
              size="sm"
              placeholder="email@exemple.fr…"
              value={search.email}
              onChange={(e) =>
                setSearch((s) => ({ ...s, email: e.target.value }))
              }
            />
          </Field.Root>

          <Box pt="6">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setSearch({
                  firstName: "",
                  lastName: "",
                  email: "",
                  dossard: "",
                });
                setPage(1);
              }}
            >
              Réinitialiser
            </Button>
          </Box>
        </HStack>
      </Box>

      {/* Data table */}
      <DataTable<AdminUser>
        columns={columns}
        data={data?.member ?? []}
        isLoading={isLoading}
        keyExtractor={(u) => u.id ?? Math.random()}
        page={page}
        totalItems={data?.totalItems ?? 0}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setPage}
        emptyMessage="Aucun utilisateur trouvé"
        sort={sort}
        onSortChange={(s) => {
          setSort(s);
          setPage(1);
        }}
        selectable
        selectedKeys={selectedIds}
        onSelectionChange={setSelectedIds}
      />

      {/* Create / Edit dialog */}
      <Dialog.Root
        open={formOpen}
        onOpenChange={({ open }) => !open && handleCloseForm()}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="md">
              <Dialog.Header>
                <Dialog.Title>
                  {editUser ? "Modifier l'utilisateur" : "Créer un utilisateur"}
                </Dialog.Title>
                <Dialog.CloseTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    position="absolute"
                    top="3"
                    right="3"
                    type="button"
                  >
                    <LuX />
                  </Button>
                </Dialog.CloseTrigger>
              </Dialog.Header>
              <UserForm user={editUser} onClose={handleCloseForm} />
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={!!deleteUser}
        onClose={() => setDeleteUser(undefined)}
        onConfirm={handleConfirmDelete}
        title="Supprimer l'utilisateur"
        description={
          deleteUser
            ? `Êtes-vous sûr de vouloir supprimer ${deleteUser.firstName ?? ""} ${deleteUser.lastName ?? ""}`.trim() +
              " ? Cette action est irréversible."
            : "Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible."
        }
        loading={deleteMutation.isPending}
      />
    </VStack>
  );
}
