"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Badge,
  Box,
  Button,
  Dialog,
  Field,
  Heading,
  HStack,
  IconButton,
  Input,
  NativeSelect,
  Portal,
  Text,
  VStack,
} from "@chakra-ui/react";
import { LuEye, LuPencil, LuTrash2, LuUser, LuX } from "react-icons/lu";
import {
  useAdminUsersQuery,
  type AdminUser,
  type UserFilters,
} from "@/state/admin/users/queries";
import { useDebounce } from "@/hooks/useDebounce";
import { type SortState } from "@/components/admin/ui/DataTable";
import { useDeleteUserMutation } from "@/state/admin/users/mutations";
import { DataTable, type Column } from "@/components/admin/ui/DataTable";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { UserForm } from "@/components/admin/UserForm";

const BulkBibDownloadButton = dynamic(
  () => import("@/components/classement/BulkBibDownloadButton"),
  { ssr: false },
);

// ---------------------------------------------------------------------------
// AdminUsersPage
// ---------------------------------------------------------------------------

const ITEMS_PER_PAGE = 30;
const CURRENT_EDITION = 2026;

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(
    new Set(),
  );
  const [search, setSearchRaw] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dossard: "",
    edition: String(CURRENT_EDITION),
  });
  const setSearch: typeof setSearchRaw = useCallback(
    (value) => {
      setSearchRaw(value);
      setPage(1);
    },
    [setPage],
  );
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
    edition: debouncedSearch.edition
      ? Number(debouncedSearch.edition)
      : undefined,
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
      render: (u) => {
        const fullName =
          `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || "-";
        const imageUrl = u.image ?? null;
        return (
          <HStack gap="2" align="center">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt=""
                style={{
                  width: "28px",
                  height: "28px",
                  objectFit: "cover",
                  borderRadius: "50%",
                  border: "1px solid var(--chakra-colors-border-subtle)",
                  flexShrink: 0,
                }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <Box
                boxSize="28px"
                rounded="full"
                bg="bg.subtle"
                borderWidth="1px"
                borderColor="border.subtle"
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
                color="fg.muted"
              >
                <LuUser size={14} />
              </Box>
            )}
            <Text>{fullName}</Text>
          </HStack>
        );
      },
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
      key: "editions",
      header: "Éditions",
      width: "140px",
      render: (u) =>
        u.editions && u.editions.length > 0 ? (
          <HStack gap="1" flexWrap="wrap">
            {u.editions.map((ed) => (
              <Badge
                key={ed}
                colorPalette={
                  ed === Math.max(...u.editions!) ? "primary" : "gray"
                }
                size="sm"
              >
                {ed}
              </Badge>
            ))}
          </HStack>
        ) : (
          <Text color="fg.muted">-</Text>
        ),
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
          <Link
            href={
              debouncedSearch.edition
                ? `/admin/users/${u.id}?edition=${debouncedSearch.edition}`
                : `/admin/users/${u.id}`
            }
          >
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
              edition={
                debouncedSearch.edition
                  ? Number(debouncedSearch.edition)
                  : CURRENT_EDITION
              }
            />
          )}
          <Button variant="outline" asChild>
            <Link href="/admin/users/bulk">+ Saisie en masse</Link>
          </Button>
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

          <Field.Root flex="0 0 140px" minW="140px">
            <Field.Label fontSize="sm">Édition</Field.Label>
            <NativeSelect.Root size="sm">
              <NativeSelect.Field
                value={search.edition}
                onChange={(e) =>
                  setSearch((s) => ({ ...s, edition: e.target.value }))
                }
              >
                <option value="">Toutes</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
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
                  edition: String(CURRENT_EDITION),
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
