"use client";

import { useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Dialog,
  Field,
  Heading,
  HStack,
  IconButton,
  Input,
  Portal,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useAdminRunsQuery, type AdminRun } from "@/state/admin/runs/queries";
import { type SortState } from "@/components/admin/ui/DataTable";
import {
  useCreateRunMutation,
  useUpdateRunMutation,
  useDeleteRunMutation,
} from "@/state/admin/runs/mutations";
import { DataTable, type Column } from "@/components/admin/ui/DataTable";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";

// ---------------------------------------------------------------------------
// RunForm — used for both create and edit
// ---------------------------------------------------------------------------

function RunForm({ run, onClose }: { run?: AdminRun; onClose: () => void }) {
  const createMutation = useCreateRunMutation();
  const updateMutation = useUpdateRunMutation();
  const [startDate, setStartDate] = useState(
    run?.startDate ? new Date(run.startDate).toISOString().slice(0, 16) : "",
  );
  const [endDate, setEndDate] = useState(
    run?.endDate ? new Date(run.endDate).toISOString().slice(0, 16) : "",
  );

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = {
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
    };
    if (run?.id) {
      await updateMutation.mutateAsync({ id: run.id, body });
    } else {
      await createMutation.mutateAsync(body);
    }
    onClose();
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <Dialog.Body>
        <VStack gap="4">
          <Field.Root required>
            <Field.Label>Date de début</Field.Label>
            <Input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </Field.Root>
          <Field.Root required>
            <Field.Label>Date de fin</Field.Label>
            <Input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
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
          {run ? "Modifier" : "Créer"}
        </Button>
      </Dialog.Footer>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// AdminRunsPage
// ---------------------------------------------------------------------------

export default function AdminRunsPage() {
  const [sort, setSort] = useState<SortState>({
    field: "startDate",
    dir: "asc",
  });
  const { data: runs, isLoading } = useAdminRunsQuery(sort.field, sort.dir);

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editRun, setEditRun] = useState<AdminRun | undefined>(undefined);
  const [deleteRun, setDeleteRun] = useState<AdminRun | undefined>(undefined);

  const deleteMutation = useDeleteRunMutation();

  // Computed stats
  const totalRuns = runs?.length ?? 0;
  const totalParticipants =
    runs?.reduce((s, r) => s + (r.participantsCount ?? 0), 0) ?? 0;
  const totalInProgress =
    runs?.reduce((s, r) => s + (r.inProgressParticipantsCount ?? 0), 0) ?? 0;
  const totalFinished =
    runs?.reduce((s, r) => s + (r.finishedParticipantsCount ?? 0), 0) ?? 0;

  // Column definitions
  const columns: Column<AdminRun>[] = [
    {
      key: "id",
      header: "#",
      render: (r) => r.id ?? "-",
      width: "60px",
      sortField: "id",
    },
    {
      key: "start",
      header: "Début",
      render: (r) =>
        r.startDate ? new Date(r.startDate).toLocaleString("fr-FR") : "-",
      sortField: "startDate",
    },
    {
      key: "end",
      header: "Fin",
      render: (r) =>
        r.endDate ? new Date(r.endDate).toLocaleString("fr-FR") : "-",
      sortField: "endDate",
    },
    {
      key: "total",
      header: "Participants",
      render: (r) => r.participantsCount ?? 0,
      width: "120px",
      sortField: "participantsCount",
    },
    {
      key: "inProgress",
      header: "En cours",
      render: (r) => (
        <Badge colorPalette="orange">
          {r.inProgressParticipantsCount ?? 0}
        </Badge>
      ),
      width: "100px",
    },
    {
      key: "finished",
      header: "Terminés",
      render: (r) => (
        <Badge colorPalette="green">{r.finishedParticipantsCount ?? 0}</Badge>
      ),
      width: "100px",
    },
    {
      key: "actions",
      header: "",
      width: "100px",
      render: (r) => (
        <HStack gap="1">
          <IconButton
            size="sm"
            variant="ghost"
            aria-label="Modifier"
            onClick={() => {
              setEditRun(r);
              setFormOpen(true);
            }}
          >
            ✏️
          </IconButton>
          <IconButton
            size="sm"
            variant="ghost"
            colorPalette="red"
            aria-label="Supprimer"
            onClick={() => setDeleteRun(r)}
          >
            🗑️
          </IconButton>
        </HStack>
      ),
    },
  ];

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditRun(undefined);
  };

  const handleConfirmDelete = async () => {
    if (deleteRun?.id) {
      await deleteMutation.mutateAsync(deleteRun.id);
    }
    setDeleteRun(undefined);
  };

  return (
    <VStack align="stretch" gap="6">
      {/* Page header */}
      <HStack justify="space-between" align="center">
        <Heading size="lg">Runs</Heading>
        <Button
          colorPalette="primary"
          onClick={() => {
            setEditRun(undefined);
            setFormOpen(true);
          }}
        >
          + Créer un run
        </Button>
      </HStack>

      {/* Stats cards */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="4">
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
              Total runs
            </Text>
            <Text fontSize="2xl" fontWeight="bold">
              {isLoading ? <Spinner size="sm" /> : totalRuns}
            </Text>
          </Card.Body>
        </Card.Root>

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
              Participants total
            </Text>
            <Text fontSize="2xl" fontWeight="bold">
              {isLoading ? <Spinner size="sm" /> : totalParticipants}
            </Text>
          </Card.Body>
        </Card.Root>

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
              En cours
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="orange.fg">
              {isLoading ? <Spinner size="sm" /> : totalInProgress}
            </Text>
          </Card.Body>
        </Card.Root>

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
              Terminés
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="green.fg">
              {isLoading ? <Spinner size="sm" /> : totalFinished}
            </Text>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>

      {/* Data table */}
      <DataTable<AdminRun>
        columns={columns}
        data={runs ?? []}
        isLoading={isLoading}
        keyExtractor={(r) => r.id ?? Math.random()}
        emptyMessage="Aucun run trouvé"
        sort={sort}
        onSortChange={setSort}
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
                  {editRun ? "Modifier le run" : "Créer un run"}
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
              <RunForm run={editRun} onClose={handleCloseForm} />
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={!!deleteRun}
        onClose={() => setDeleteRun(undefined)}
        onConfirm={handleConfirmDelete}
        title="Supprimer le run"
        description={
          deleteRun?.startDate
            ? `Êtes-vous sûr de vouloir supprimer le run du ${new Date(deleteRun.startDate).toLocaleString("fr-FR")} ? Cette action est irréversible.`
            : "Êtes-vous sûr de vouloir supprimer ce run ? Cette action est irréversible."
        }
        loading={deleteMutation.isPending}
      />
    </VStack>
  );
}
