"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  Dialog,
  Heading,
  HStack,
  IconButton,
  Portal,
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
  LuGauge,
  LuZap,
} from "react-icons/lu";
import { useAdminRunsQuery, type AdminRun } from "@/state/admin/runs/queries";
import { type SortState } from "@/components/admin/ui/DataTable";
import { useDeleteRunMutation } from "@/state/admin/runs/mutations";
import { DataTable, type Column } from "@/components/admin/ui/DataTable";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { StatCard } from "@/components/admin/ui/StatCard";
import { RunForm } from "@/components/admin/RunForm";
import { BatchRunGenerator } from "@/components/admin/BatchRunGenerator";
import { formatTimeVerbose } from "@/utils/race";

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

  // Global average / fastest across all runs
  const allAverageTimes = (runs ?? [])
    .map((r) => r.averageTime)
    .filter((t): t is number => t != null);
  const globalAverageTime =
    allAverageTimes.length > 0
      ? Math.round(
          allAverageTimes.reduce((a, b) => a + b, 0) / allAverageTimes.length,
        )
      : null;
  const allFastestTimes = (runs ?? [])
    .map((r) => r.fastestTime)
    .filter((t): t is number => t != null);
  const globalFastestTime =
    allFastestTimes.length > 0 ? Math.min(...allFastestTimes) : null;

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
      key: "averageTime",
      header: "Temps moy.",
      render: (r) => (
        <Text fontFamily="mono" fontSize="sm">
          {formatTimeVerbose(r.averageTime)}
        </Text>
      ),
      width: "120px",
    },
    {
      key: "fastestTime",
      header: "Plus rapide",
      render: (r) => (
        <Text fontFamily="mono" fontSize="sm" color="stat.green">
          {formatTimeVerbose(r.fastestTime)}
        </Text>
      ),
      width: "120px",
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
      <SimpleGrid columns={{ base: 2, sm: 3, lg: 6 }} gap="4">
        <StatCard
          label="Total runs"
          value={totalRuns}
          icon={LuTimer}
          color="primary.500"
          loading={isLoading}
          index={0}
        />
        <StatCard
          label="Participants"
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
        <StatCard
          label="Temps moyen"
          value={formatTimeVerbose(globalAverageTime)}
          icon={LuGauge}
          color="stat.orange"
          loading={isLoading}
          index={4}
        />
        <StatCard
          label="Plus rapide"
          value={formatTimeVerbose(globalFastestTime)}
          icon={LuZap}
          color="stat.green"
          loading={isLoading}
          index={5}
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
