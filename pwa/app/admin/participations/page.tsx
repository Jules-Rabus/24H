"use client"

import { useState } from "react"
import {
  Badge,
  Box,
  Button,
  Dialog,
  Field,
  HStack,
  Heading,
  Input,
  Portal,
  Select,
  Stack,
  Text,
  VStack,
  IconButton,
} from "@chakra-ui/react"
import {
  useAdminParticipationsQuery,
  type AdminParticipation,
  type ParticipationFilters,
} from "@/state/admin/participations/queries"
import {
  useUpdateParticipationMutation,
  useDeleteParticipationMutation,
} from "@/state/admin/participations/mutations"
import { DataTable, type Column } from "@/components/admin/ui/DataTable"
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTime(seconds: number | null | undefined): string {
  if (!seconds) return "-"
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s.toString().padStart(2, "0")}s`
}

function iriToId(iri: string | null | undefined): string {
  if (!iri) return "-"
  return iri.split("/").at(-1) ?? "-"
}

// ---------------------------------------------------------------------------
// Edit dialog
// ---------------------------------------------------------------------------

function EditParticipationDialog({
  participation,
  onClose,
}: {
  participation: AdminParticipation
  onClose: () => void
}) {
  const updateMutation = useUpdateParticipationMutation()
  const [arrivalTime, setArrivalTime] = useState(
    participation.arrivalTime
      ? new Date(participation.arrivalTime).toISOString().slice(0, 16)
      : ""
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!participation.id) return
    await updateMutation.mutateAsync({
      id: participation.id,
      arrivalTime: arrivalTime ? new Date(arrivalTime).toISOString() : null,
    })
    onClose()
  }

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <Dialog.Body>
        <Field.Root>
          <Field.Label>Heure d&apos;arrivée</Field.Label>
          <Input
            type="datetime-local"
            value={arrivalTime}
            onChange={(e) => setArrivalTime(e.target.value)}
          />
          <Field.HelperText>
            Laisser vide pour remettre en IN_PROGRESS
          </Field.HelperText>
        </Field.Root>
      </Dialog.Body>
      <Dialog.Footer gap="3">
        <Button variant="outline" onClick={onClose} type="button">
          Annuler
        </Button>
        <Button
          type="submit"
          colorPalette="primary"
          loading={updateMutation.isPending}
        >
          Enregistrer
        </Button>
      </Dialog.Footer>
    </Box>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ParticipationsPage() {
  const [filters, setFilters] = useState<ParticipationFilters>({
    page: 1,
    itemsPerPage: 30,
  })
  const [statusFilter, setStatusFilter] = useState("")
  const [firstNameInput, setFirstNameInput] = useState("")
  const [lastNameInput, setLastNameInput] = useState("")
  const [dossardInput, setDossardInput] = useState("")

  const [editParticipation, setEditParticipation] =
    useState<AdminParticipation | null>(null)
  const [deleteParticipation, setDeleteParticipation] =
    useState<AdminParticipation | null>(null)

  const { data, isLoading } = useAdminParticipationsQuery(filters)
  const deleteMutation = useDeleteParticipationMutation()

  // Client-side status filter (API does not support status filtering)
  const filtered = statusFilter
    ? (data?.member ?? []).filter((p) => p.status === statusFilter)
    : (data?.member ?? [])

  // Apply API-side filters on search
  const applyFilters = () => {
    setFilters({
      page: 1,
      itemsPerPage: 30,
      ...(firstNameInput ? { "user.firstName": firstNameInput } : {}),
      ...(lastNameInput ? { "user.lastName": lastNameInput } : {}),
      ...(dossardInput ? { "user.surname": dossardInput } : {}),
    })
  }

  const resetFilters = () => {
    setFirstNameInput("")
    setLastNameInput("")
    setDossardInput("")
    setStatusFilter("")
    setFilters({ page: 1, itemsPerPage: 30 })
  }

  // ------------------------------------------------------------------
  // Table columns
  // ------------------------------------------------------------------
  const columns: Column<AdminParticipation>[] = [
    {
      key: "run",
      header: "Run",
      render: (row) => (
        <Text fontWeight="medium">Run #{iriToId(row.run)}</Text>
      ),
      width: "110px",
    },
    {
      key: "user",
      header: "Coureur",
      render: (row) => <Text>User #{iriToId(row.user)}</Text>,
      width: "120px",
    },
    {
      key: "arrivalTime",
      header: "Heure d'arrivée",
      render: (row) =>
        row.arrivalTime
          ? new Date(row.arrivalTime).toLocaleString("fr-FR", {
              dateStyle: "short",
              timeStyle: "short",
            })
          : <Text color="fg.muted">-</Text>,
    },
    {
      key: "totalTime",
      header: "Temps total",
      render: (row) => (
        <Text fontFamily="mono">{formatTime(row.totalTime)}</Text>
      ),
      width: "130px",
    },
    {
      key: "status",
      header: "Statut",
      render: (row) =>
        row.status === "FINISHED" ? (
          <Badge colorPalette="green" size="sm">
            Terminé
          </Badge>
        ) : (
          <Badge colorPalette="orange" size="sm">
            En cours
          </Badge>
        ),
      width: "120px",
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <HStack gap="2">
          <IconButton
            aria-label="Modifier"
            size="xs"
            variant="outline"
            title="Modifier l'heure d'arrivée"
            onClick={() => setEditParticipation(row)}
          >
            ✏️
          </IconButton>
          <IconButton
            aria-label="Supprimer"
            size="xs"
            variant="outline"
            colorPalette="red"
            title="Supprimer la participation"
            onClick={() => setDeleteParticipation(row)}
          >
            🗑️
          </IconButton>
        </HStack>
      ),
      width: "100px",
    },
  ]

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  return (
    <Box p={{ base: "4", md: "8" }} maxW="7xl" mx="auto">
      {/* Page header */}
      <VStack align="start" gap="1" mb="6">
        <Heading size="xl" fontWeight="bold">
          Participations
        </Heading>
        <Text color="fg.muted" fontSize="sm">
          {data?.totalItems ?? 0} participation
          {(data?.totalItems ?? 0) !== 1 ? "s" : ""} au total
        </Text>
      </VStack>

      {/* Filters */}
      <Box
        p="4"
        mb="6"
        borderWidth="1px"
        borderColor="border.subtle"
        rounded="lg"
        bg="bg.subtle"
      >
        <Stack gap="4">
          <HStack gap="3" flexWrap="wrap">
            {/* First name */}
            <Field.Root flex="1" minW="160px">
              <Field.Label fontSize="sm">Prénom</Field.Label>
              <Input
                size="sm"
                placeholder="Prénom du coureur"
                value={firstNameInput}
                onChange={(e) => setFirstNameInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              />
            </Field.Root>

            {/* Last name */}
            <Field.Root flex="1" minW="160px">
              <Field.Label fontSize="sm">Nom</Field.Label>
              <Input
                size="sm"
                placeholder="Nom du coureur"
                value={lastNameInput}
                onChange={(e) => setLastNameInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              />
            </Field.Root>

            {/* Dossard (user.id / user.surname) */}
            <Field.Root flex="1" minW="140px">
              <Field.Label fontSize="sm">N° dossard</Field.Label>
              <Input
                size="sm"
                placeholder="Ex : 42"
                value={dossardInput}
                onChange={(e) => setDossardInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              />
            </Field.Root>

            {/* Status — client-side filter */}
            <Field.Root flex="1" minW="160px">
              <Field.Label fontSize="sm">Statut</Field.Label>
              <Select.Root
                size="sm"
                value={[statusFilter]}
                onValueChange={({ value }) => setStatusFilter(value[0] ?? "")}
              >
                <Select.Trigger>
                  <Select.ValueText placeholder="Tous les statuts" />
                </Select.Trigger>
                <Portal>
                  <Select.Positioner>
                    <Select.Content>
                      <Select.Item item={{ label: "Tous", value: "" }}>
                        Tous
                      </Select.Item>
                      <Select.Item item={{ label: "Terminé", value: "FINISHED" }}>
                        Terminé
                      </Select.Item>
                      <Select.Item
                        item={{ label: "En cours", value: "IN_PROGRESS" }}
                      >
                        En cours
                      </Select.Item>
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
              </Select.Root>
            </Field.Root>
          </HStack>

          <HStack gap="2" justify="flex-end">
            <Button size="sm" variant="outline" onClick={resetFilters}>
              Réinitialiser
            </Button>
            <Button size="sm" colorPalette="primary" onClick={applyFilters}>
              Rechercher
            </Button>
          </HStack>
        </Stack>
      </Box>

      {/* Table */}
      <DataTable<AdminParticipation>
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        keyExtractor={(row) => row.id ?? Math.random()}
        page={filters.page ?? 1}
        totalItems={data?.totalItems ?? 0}
        itemsPerPage={filters.itemsPerPage ?? 30}
        onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
        emptyMessage="Aucune participation trouvée"
      />

      {/* Edit dialog */}
      <Dialog.Root
        open={editParticipation !== null}
        onOpenChange={({ open }) => !open && setEditParticipation(null)}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="md">
              <Dialog.Header>
                <Dialog.Title>
                  Modifier la participation{" "}
                  {editParticipation?.id ? `#${editParticipation.id}` : ""}
                </Dialog.Title>
                <Dialog.CloseTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    position="absolute"
                    top="3"
                    right="3"
                  >
                    ✕
                  </Button>
                </Dialog.CloseTrigger>
              </Dialog.Header>
              {editParticipation && (
                <EditParticipationDialog
                  participation={editParticipation}
                  onClose={() => setEditParticipation(null)}
                />
              )}
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteParticipation !== null}
        onClose={() => setDeleteParticipation(null)}
        onConfirm={async () => {
          if (!deleteParticipation?.id) return
          await deleteMutation.mutateAsync(deleteParticipation.id)
          setDeleteParticipation(null)
        }}
        title="Supprimer la participation"
        description={
          deleteParticipation?.id
            ? `Êtes-vous sûr de vouloir supprimer la participation #${deleteParticipation.id} ? Cette action est irréversible.`
            : "Êtes-vous sûr de vouloir supprimer cette participation ?"
        }
        loading={deleteMutation.isPending}
      />
    </Box>
  )
}
