"use client"

import { useState } from "react"
import Link from "next/link"
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
} from "@chakra-ui/react"
import {
  useAdminUsersQuery,
  type AdminUser,
  type UserFilters,
} from "@/state/admin/users/queries"
import {
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "@/state/admin/users/mutations"
import { DataTable, type Column } from "@/components/admin/ui/DataTable"
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog"

// ---------------------------------------------------------------------------
// UserForm — used for both create and edit
// ---------------------------------------------------------------------------

function UserForm({ user, onClose }: { user?: AdminUser; onClose: () => void }) {
  const createMutation = useCreateUserMutation()
  const updateMutation = useUpdateUserMutation()

  const [form, setForm] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    surname: user?.surname ?? "",
    email: user?.email ?? "",
    plainPassword: "",
    organization: user?.organization ?? "",
    isAdmin: user?.roles?.includes("ROLE_ADMIN") ?? false,
  })

  const isLoading = createMutation.isPending || updateMutation.isPending

  const handleChange = (field: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const roles: string[] = form.isAdmin
      ? ["ROLE_USER", "ROLE_ADMIN"]
      : ["ROLE_USER"]

    const body = {
      firstName: form.firstName,
      lastName: form.lastName,
      surname: form.surname || null,
      email: form.email || null,
      organization: form.organization || null,
      roles,
      ...(form.plainPassword ? { plainPassword: form.plainPassword } : {}),
    }

    if (user?.id) {
      await updateMutation.mutateAsync({ id: user.id, body })
    } else {
      await createMutation.mutateAsync({
        ...body,
        plainPassword: form.plainPassword || null,
      })
    }
    onClose()
  }

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

          {!user && (
            <Field.Root>
              <Field.Label>Mot de passe</Field.Label>
              <Input
                type="password"
                value={form.plainPassword}
                onChange={(e) => handleChange("plainPassword", e.target.value)}
                placeholder="Mot de passe"
              />
            </Field.Root>
          )}

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
        <Button variant="outline" onClick={onClose} type="button" disabled={isLoading}>
          Annuler
        </Button>
        <Button type="submit" colorPalette="primary" loading={isLoading}>
          {user ? "Modifier" : "Créer"}
        </Button>
      </Dialog.Footer>
    </Box>
  )
}

// ---------------------------------------------------------------------------
// AdminUsersPage
// ---------------------------------------------------------------------------

const ITEMS_PER_PAGE = 30

export default function AdminUsersPage() {
  const [filters, setFilters] = useState<UserFilters>({ page: 1, itemsPerPage: ITEMS_PER_PAGE })
  const [search, setSearch] = useState({ firstName: "", lastName: "", email: "" })

  const { data, isLoading } = useAdminUsersQuery(filters)

  const [formOpen, setFormOpen] = useState(false)
  const [editUser, setEditUser] = useState<AdminUser | undefined>(undefined)
  const [deleteUser, setDeleteUser] = useState<AdminUser | undefined>(undefined)

  const deleteMutation = useDeleteUserMutation()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFilters({
      page: 1,
      itemsPerPage: ITEMS_PER_PAGE,
      firstName: search.firstName || undefined,
      lastName: search.lastName || undefined,
      email: search.email || undefined,
    })
  }

  const handleCloseForm = () => {
    setFormOpen(false)
    setEditUser(undefined)
  }

  const handleConfirmDelete = async () => {
    if (deleteUser?.id) {
      await deleteMutation.mutateAsync(deleteUser.id)
    }
    setDeleteUser(undefined)
  }

  const columns: Column<AdminUser>[] = [
    {
      key: "id",
      header: "#",
      render: (u) => u.id ?? "-",
      width: "60px",
    },
    {
      key: "name",
      header: "Nom",
      render: (u) => `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || "-",
    },
    {
      key: "surname",
      header: "Surnom",
      render: (u) => u.surname ?? "-",
    },
    {
      key: "email",
      header: "Email",
      render: (u) => u.email ?? "-",
    },
    {
      key: "org",
      header: "Organisation",
      render: (u) => u.organization ?? "-",
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
              👁️
            </IconButton>
          </Link>
          <IconButton
            size="sm"
            variant="ghost"
            aria-label="Modifier"
            onClick={() => {
              setEditUser(u)
              setFormOpen(true)
            }}
          >
            ✏️
          </IconButton>
          <IconButton
            size="sm"
            variant="ghost"
            colorPalette="red"
            aria-label="Supprimer"
            onClick={() => setDeleteUser(u)}
          >
            🗑️
          </IconButton>
        </HStack>
      ),
    },
  ]

  return (
    <VStack align="stretch" gap="6">
      {/* Page header */}
      <HStack justify="space-between" align="center">
        <Heading size="lg">Utilisateurs</Heading>
        <Button
          colorPalette="primary"
          onClick={() => {
            setEditUser(undefined)
            setFormOpen(true)
          }}
        >
          + Créer un utilisateur
        </Button>
      </HStack>

      {/* Search bar */}
      <Box
        as="form"
        onSubmit={handleSearch}
        bg="white"
        borderWidth="1px"
        borderColor="border.subtle"
        rounded="lg"
        p="4"
      >
        <HStack gap="3" flexWrap="wrap">
          <Field.Root flex="1" minW="160px">
            <Field.Label fontSize="sm">Prénom</Field.Label>
            <Input
              size="sm"
              placeholder="Prénom…"
              value={search.firstName}
              onChange={(e) => setSearch((s) => ({ ...s, firstName: e.target.value }))}
            />
          </Field.Root>

          <Field.Root flex="1" minW="160px">
            <Field.Label fontSize="sm">Nom</Field.Label>
            <Input
              size="sm"
              placeholder="Nom…"
              value={search.lastName}
              onChange={(e) => setSearch((s) => ({ ...s, lastName: e.target.value }))}
            />
          </Field.Root>

          <Field.Root flex="1" minW="200px">
            <Field.Label fontSize="sm">Email</Field.Label>
            <Input
              size="sm"
              placeholder="email@exemple.fr…"
              value={search.email}
              onChange={(e) => setSearch((s) => ({ ...s, email: e.target.value }))}
            />
          </Field.Root>

          <Box pt="6">
            <Button type="submit" size="sm" colorPalette="primary">
              Rechercher
            </Button>
          </Box>

          <Box pt="6">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setSearch({ firstName: "", lastName: "", email: "" })
                setFilters({ page: 1, itemsPerPage: ITEMS_PER_PAGE })
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
        page={filters.page ?? 1}
        totalItems={data?.totalItems ?? 0}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
        emptyMessage="Aucun utilisateur trouvé"
      />

      {/* Create / Edit dialog */}
      <Dialog.Root open={formOpen} onOpenChange={({ open }) => !open && handleCloseForm()}>
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
                    ✕
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
  )
}
