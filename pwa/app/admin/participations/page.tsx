"use client";

import { useCallback, useState } from "react";
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
  Text,
  VStack,
  IconButton,
  createListCollection,
} from "@chakra-ui/react";
import Link from "next/link";
import { LuPencil, LuTrash2, LuX } from "react-icons/lu";
import { useDebounce } from "@/hooks/useDebounce";
import {
  useAdminParticipationsQuery,
  type AdminParticipation,
  type ParticipationFilters,
} from "@/state/admin/participations/queries";
import { type SortState } from "@/components/admin/ui/DataTable";
import { useDeleteParticipationMutation } from "@/state/admin/participations/mutations";
import { DataTable, type Column } from "@/components/admin/ui/DataTable";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { CreateParticipationDialog } from "@/components/admin/CreateParticipationDialog";
import { EditParticipationDialog } from "@/components/admin/EditParticipationDialog";
import { formatTimeShort } from "@/utils/race";

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ParticipationsPage() {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortState>({ field: "run.id", dir: "asc" });
  const [search, setSearchRaw] = useState({
    firstName: "",
    lastName: "",
    dossard: "",
    status: "",
  });
  const setSearch: typeof setSearchRaw = useCallback(
    (value) => {
      setSearchRaw(value);
      setPage(1);
    },
    [setPage],
  );

  const debouncedSearch = useDebounce(search, 300);

  const filters: ParticipationFilters = {
    page,
    itemsPerPage: 30,
    orderField: sort.field,
    orderDir: sort.dir,
    "user.firstName": debouncedSearch.firstName || undefined,
    "user.lastName": debouncedSearch.lastName || undefined,
    "user.id": debouncedSearch.dossard || undefined,
  };

  const [createOpen, setCreateOpen] = useState(false);
  const [editParticipation, setEditParticipation] =
    useState<AdminParticipation | null>(null);
  const [deleteParticipation, setDeleteParticipation] =
    useState<AdminParticipation | null>(null);

  const { data, isLoading } = useAdminParticipationsQuery(filters);
  const deleteMutation = useDeleteParticipationMutation();

  // Client-side status filter (API does not support status filtering)
  const filtered = search.status
    ? (data?.member ?? []).filter((p) => p.status === search.status)
    : (data?.member ?? []);

  // ------------------------------------------------------------------
  // Table columns
  // ------------------------------------------------------------------
  const columns: Column<AdminParticipation>[] = [
    {
      key: "run",
      header: "Run",
      render: (row) => (
        <Text fontWeight="medium">Run #{row.run?.id ?? "-"}</Text>
      ),
      width: "110px",
      sortField: "run.id",
    },
    {
      key: "user",
      header: "Coureur",
      render: (row) => {
        const name = row.user
          ? `${row.user.firstName ?? ""} ${row.user.lastName ?? ""}`.trim() ||
            `#${row.user.id}`
          : "-";
        if (row.user?.id) {
          return (
            <Link href={`/admin/users/${row.user.id}`}>
              <Text
                fontWeight="medium"
                color="primary.fg"
                _hover={{ textDecoration: "underline" }}
                cursor="pointer"
              >
                {name}
              </Text>
            </Link>
          );
        }
        return <Text>{name}</Text>;
      },
      width: "160px",
      sortField: "user.lastName",
    },
    {
      key: "arrivalTime",
      header: "Heure d'arrivée",
      render: (row) =>
        row.arrivalTime ? (
          new Date(row.arrivalTime).toLocaleString("fr-FR", {
            dateStyle: "short",
            timeStyle: "short",
          })
        ) : (
          <Text color="fg.muted">-</Text>
        ),
      sortField: "arrivalTime",
    },
    {
      key: "totalTime",
      header: "Temps total",
      render: (row) => (
        <Text fontFamily="mono">{formatTimeShort(row.totalTime)}</Text>
      ),
      width: "130px",
      sortField: "totalTime",
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
            <LuPencil />
          </IconButton>
          <IconButton
            aria-label="Supprimer"
            size="xs"
            variant="outline"
            colorPalette="red"
            title="Supprimer la participation"
            onClick={() => setDeleteParticipation(row)}
          >
            <LuTrash2 />
          </IconButton>
        </HStack>
      ),
      width: "100px",
    },
  ];

  const statusCollection = createListCollection({
    items: [
      { label: "Tous", value: "" },
      { label: "Terminé", value: "FINISHED" },
      { label: "En cours", value: "IN_PROGRESS" },
    ],
  });

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  return (
    <Box p={{ base: "4", md: "8" }} maxW="7xl" mx="auto">
      {/* Page header */}
      <HStack
        justify="space-between"
        align="center"
        mb="6"
        flexWrap="wrap"
        gap="3"
      >
        <VStack align="start" gap="1">
          <Heading size="xl" fontWeight="bold">
            Participations
          </Heading>
          <Text color="fg.muted" fontSize="sm">
            {data?.totalItems ?? 0} participation
            {(data?.totalItems ?? 0) !== 1 ? "s" : ""} au total
          </Text>
        </VStack>
        <Button colorPalette="primary" onClick={() => setCreateOpen(true)}>
          + Nouvelle participation
        </Button>
      </HStack>

      {/* Filters — debounced, no submit button */}
      <Box
        p="4"
        mb="6"
        borderWidth="1px"
        borderColor="border.subtle"
        rounded="lg"
        bg="bg.subtle"
      >
        <HStack gap="3" flexWrap="wrap">
          {/* First name */}
          <Field.Root flex="1" minW="160px">
            <Field.Label fontSize="sm">Prénom</Field.Label>
            <Input
              size="sm"
              placeholder="Prénom du coureur"
              value={search.firstName}
              onChange={(e) =>
                setSearch((s) => ({ ...s, firstName: e.target.value }))
              }
            />
          </Field.Root>

          {/* Last name */}
          <Field.Root flex="1" minW="160px">
            <Field.Label fontSize="sm">Nom</Field.Label>
            <Input
              size="sm"
              placeholder="Nom du coureur"
              value={search.lastName}
              onChange={(e) =>
                setSearch((s) => ({ ...s, lastName: e.target.value }))
              }
            />
          </Field.Root>

          {/* Dossard */}
          <Field.Root flex="1" minW="140px">
            <Field.Label fontSize="sm">N° dossard</Field.Label>
            <Input
              size="sm"
              placeholder="Ex : 42"
              value={search.dossard}
              onChange={(e) =>
                setSearch((s) => ({ ...s, dossard: e.target.value }))
              }
            />
          </Field.Root>

          {/* Status — client-side filter */}
          <Field.Root flex="1" minW="160px">
            <Field.Label fontSize="sm">Statut</Field.Label>
            <Select.Root
              size="sm"
              collection={statusCollection}
              value={[search.status]}
              onValueChange={({ value }) =>
                setSearch((s) => ({ ...s, status: value[0] ?? "" }))
              }
            >
              <Select.Trigger>
                <Select.ValueText placeholder="Tous les statuts" />
              </Select.Trigger>
              <Portal>
                <Select.Positioner>
                  <Select.Content>
                    {statusCollection.items.map((item) => (
                      <Select.Item key={item.value} item={item}>
                        {item.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>
          </Field.Root>

          <Box pt="6">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSearch({
                  firstName: "",
                  lastName: "",
                  dossard: "",
                  status: "",
                });
                setPage(1);
              }}
            >
              Réinitialiser
            </Button>
          </Box>
        </HStack>
      </Box>

      {/* Table */}
      <DataTable<AdminParticipation>
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        keyExtractor={(row) => row.id ?? Math.random()}
        page={page}
        totalItems={data?.totalItems ?? 0}
        itemsPerPage={30}
        onPageChange={setPage}
        emptyMessage="Aucune participation trouvée"
        sort={sort}
        onSortChange={(s) => {
          setSort(s);
          setPage(1);
        }}
      />

      {/* Create dialog */}
      <Dialog.Root
        open={createOpen}
        onOpenChange={({ open }) => !open && setCreateOpen(false)}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="md">
              <Dialog.Header>
                <Dialog.Title>Nouvelle participation</Dialog.Title>
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
              {createOpen && (
                <CreateParticipationDialog
                  onClose={() => setCreateOpen(false)}
                />
              )}
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

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
                    <LuX />
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
          if (!deleteParticipation?.id) return;
          await deleteMutation.mutateAsync(deleteParticipation.id);
          setDeleteParticipation(null);
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
  );
}
