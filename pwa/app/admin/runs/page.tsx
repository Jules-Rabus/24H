"use client";

import { useState } from "react";
import Link from "next/link";
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
  Portal,
  Progress,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  LuPencil,
  LuTrash2,
  LuX,
  LuEye,
  LuTimer,
  LuUsers,
  LuPlay,
  LuCircleCheck,
  LuCalendarPlus,
} from "react-icons/lu";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { useAdminRunsQuery, type AdminRun } from "@/state/admin/runs/queries";
import { type SortState } from "@/components/admin/ui/DataTable";
import {
  useCreateRunMutation,
  useUpdateRunMutation,
  useDeleteRunMutation,
} from "@/state/admin/runs/mutations";
import { DataTable, type Column } from "@/components/admin/ui/DataTable";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { StatCard } from "@/components/admin/ui/StatCard";

// ---------------------------------------------------------------------------
// RunForm — TanStack Form + Zod
// ---------------------------------------------------------------------------

function RunForm({ run, onClose }: { run?: AdminRun; onClose: () => void }) {
  const createMutation = useCreateRunMutation();
  const updateMutation = useUpdateRunMutation();

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const form = useForm({
    defaultValues: {
      startDate: run?.startDate
        ? new Date(run.startDate).toISOString().slice(0, 16)
        : "",
      endDate: run?.endDate
        ? new Date(run.endDate).toISOString().slice(0, 16)
        : "",
    },
    onSubmit: async ({ value }) => {
      const body = {
        startDate: new Date(value.startDate).toISOString(),
        endDate: new Date(value.endDate).toISOString(),
      };
      if (run?.id) {
        await updateMutation.mutateAsync({ id: run.id, body });
      } else {
        await createMutation.mutateAsync(body);
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
            name="startDate"
            validators={{
              onChange: ({ value }) => {
                const r = z
                  .string()
                  .min(1, "Date de début requise")
                  .safeParse(value);
                return r.success ? undefined : r.error.issues[0].message;
              },
            }}
          >
            {(field) => (
              <Field.Root required invalid={!!field.state.meta.errors.length}>
                <Field.Label>Date de début</Field.Label>
                <Input
                  type="datetime-local"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                <Field.ErrorText>{field.state.meta.errors[0]}</Field.ErrorText>
              </Field.Root>
            )}
          </form.Field>
          <form.Field
            name="endDate"
            validators={{
              onChange: ({ value }) => {
                const r = z
                  .string()
                  .min(1, "Date de fin requise")
                  .safeParse(value);
                if (!r.success) return r.error.issues[0].message;
                const start = form.getFieldValue("startDate");
                if (start && new Date(value) <= new Date(start)) {
                  return "La fin doit être après le début";
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <Field.Root required invalid={!!field.state.meta.errors.length}>
                <Field.Label>Date de fin</Field.Label>
                <Input
                  type="datetime-local"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                <Field.ErrorText>{field.state.meta.errors[0]}</Field.ErrorText>
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
          {run ? "Modifier" : "Créer"}
        </Button>
      </Dialog.Footer>
    </form>
  );
}

// ---------------------------------------------------------------------------
// BatchRunGenerator — generates 1 run per hour between two dates
// ---------------------------------------------------------------------------

function BatchRunGenerator({ onClose }: { onClose: () => void }) {
  const createMutation = useCreateRunMutation();
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  const form = useForm({
    defaultValues: { firstHour: "", lastHour: "" },
    onSubmit: async ({ value }) => {
      const start = new Date(value.firstHour);
      const end = new Date(value.lastHour);
      const runs: { startDate: string; endDate: string }[] = [];
      const cursor = new Date(start);
      while (cursor < end) {
        const runStart = new Date(cursor);
        cursor.setHours(cursor.getHours() + 1);
        runs.push({
          startDate: runStart.toISOString(),
          endDate: new Date(cursor).toISOString(),
        });
      }
      setProgress({ current: 0, total: runs.length });
      for (let i = 0; i < runs.length; i++) {
        await createMutation.mutateAsync(runs[i]);
        setProgress({ current: i + 1, total: runs.length });
      }
      onClose();
    },
  });

  const [previewCount, setPreviewCount] = useState(0);
  const updatePreview = () => {
    const fh = form.getFieldValue("firstHour");
    const lh = form.getFieldValue("lastHour");
    if (fh && lh) {
      setPreviewCount(
        Math.max(
          0,
          Math.ceil(
            (new Date(lh).getTime() - new Date(fh).getTime()) / 3_600_000,
          ),
        ),
      );
    } else {
      setPreviewCount(0);
    }
  };

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
            name="firstHour"
            validators={{
              onChange: ({ value }) =>
                value ? undefined : "Heure de départ requise",
            }}
          >
            {(field) => (
              <Field.Root required invalid={!!field.state.meta.errors.length}>
                <Field.Label>Première heure</Field.Label>
                <Input
                  type="datetime-local"
                  value={field.state.value}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                    setTimeout(updatePreview, 0);
                  }}
                  onBlur={field.handleBlur}
                />
                <Field.ErrorText>{field.state.meta.errors[0]}</Field.ErrorText>
              </Field.Root>
            )}
          </form.Field>
          <form.Field
            name="lastHour"
            validators={{
              onChange: ({ value }) => {
                if (!value) return "Heure de fin requise";
                const start = form.getFieldValue("firstHour");
                if (start && new Date(value) <= new Date(start)) {
                  return "Doit être après la première heure";
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <Field.Root required invalid={!!field.state.meta.errors.length}>
                <Field.Label>Dernière heure</Field.Label>
                <Input
                  type="datetime-local"
                  value={field.state.value}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                    setTimeout(updatePreview, 0);
                  }}
                  onBlur={field.handleBlur}
                />
                <Field.ErrorText>{field.state.meta.errors[0]}</Field.ErrorText>
              </Field.Root>
            )}
          </form.Field>

          {previewCount > 0 && (
            <Text fontSize="sm" color="fg.muted">
              Cela créera <strong>{previewCount}</strong> run
              {previewCount > 1 ? "s" : ""} (1 par heure)
            </Text>
          )}

          {progress && (
            <VStack gap="2" w="full">
              <Progress.Root
                value={(progress.current / progress.total) * 100}
                size="sm"
                colorPalette="primary"
              >
                <Progress.Track>
                  <Progress.Range />
                </Progress.Track>
              </Progress.Root>
              <Text fontSize="xs" color="fg.muted">
                {progress.current} / {progress.total} runs créés
              </Text>
            </VStack>
          )}
        </VStack>
      </Dialog.Body>
      <Dialog.Footer gap="3">
        <Button
          variant="outline"
          onClick={onClose}
          type="button"
          disabled={!!progress}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          colorPalette="primary"
          loading={!!progress}
          disabled={previewCount === 0}
        >
          Générer {previewCount} run{previewCount > 1 ? "s" : ""}
        </Button>
      </Dialog.Footer>
    </form>
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
  const [batchOpen, setBatchOpen] = useState(false);

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
      render: (r) =>
        r.id ? (
          <Link href={`/admin/runs/${r.id}`}>
            <Text
              as="span"
              color="primary.fg"
              fontWeight="medium"
              _hover={{ textDecoration: "underline" }}
            >
              {r.id}
            </Text>
          </Link>
        ) : (
          "-"
        ),
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
      width: "140px",
      render: (r) => (
        <HStack gap="1">
          {r.id && (
            <Link href={`/admin/runs/${r.id}`}>
              <IconButton
                size="sm"
                variant="ghost"
                aria-label="Voir le détail"
                title="Voir le détail"
              >
                <LuEye />
              </IconButton>
            </Link>
          )}
          <IconButton
            size="sm"
            variant="ghost"
            aria-label="Modifier"
            onClick={() => {
              setEditRun(r);
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
            onClick={() => setDeleteRun(r)}
          >
            <LuTrash2 />
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
        <HStack gap="2">
          <Button
            variant="outline"
            colorPalette="primary"
            onClick={() => setBatchOpen(true)}
          >
            <LuCalendarPlus /> Générer les runs
          </Button>
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
      </HStack>

      {/* Stats cards */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="4">
        <StatCard
          label="Total runs"
          value={totalRuns}
          icon={LuTimer}
          color="primary.500"
          loading={isLoading}
          index={0}
        />
        <StatCard
          label="Participants total"
          value={totalParticipants}
          icon={LuUsers}
          color="stat.blue"
          loading={isLoading}
          index={1}
        />
        <StatCard
          label="En cours"
          value={totalInProgress}
          icon={LuPlay}
          color="stat.orange"
          loading={isLoading}
          index={2}
        />
        <StatCard
          label="Terminés"
          value={totalFinished}
          icon={LuCircleCheck}
          color="stat.green"
          loading={isLoading}
          index={3}
        />
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
                    <LuX />
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

      {/* Batch run generator dialog */}
      <Dialog.Root
        open={batchOpen}
        onOpenChange={({ open }) => !open && setBatchOpen(false)}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="md">
              <Dialog.Header>
                <Dialog.Title>Générer les runs (1 par heure)</Dialog.Title>
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
              <BatchRunGenerator onClose={() => setBatchOpen(false)} />
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </VStack>
  );
}
