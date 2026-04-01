"use client";

import { use, useState } from "react";
import Link from "next/link";
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
import {
  LuPencil,
  LuTrash2,
  LuX,
  LuUsers,
  LuPlay,
  LuCircleCheck,
  LuTimer,
  LuGauge,
  LuZap,
} from "react-icons/lu";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { useAdminRunQuery } from "@/state/admin/runs/queries";
import {
  useAdminRunParticipationsQuery,
  type AdminParticipation,
} from "@/state/admin/participations/queries";
import {
  useUpdateParticipationMutation,
  useDeleteParticipationMutation,
} from "@/state/admin/participations/mutations";
import { DataTable, type Column } from "@/components/admin/ui/DataTable";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { StatCard } from "@/components/admin/ui/StatCard";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTime(seconds: number | null | undefined): string {
  if (!seconds) return "-";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m`;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

// ---------------------------------------------------------------------------
// EditArrivalTimeForm — inline dialog to edit a participation's arrivalTime
// ---------------------------------------------------------------------------

function EditArrivalTimeForm({
  participation,
  onClose,
}: {
  participation: AdminParticipation;
  onClose: () => void;
}) {
  const updateMutation = useUpdateParticipationMutation();
  const isLoading = updateMutation.isPending;

  const form = useForm({
    defaultValues: {
      arrivalTime: participation.arrivalTime
        ? new Date(participation.arrivalTime).toISOString().slice(0, 16)
        : "",
    },
    onSubmit: async ({ value }) => {
      await updateMutation.mutateAsync({
        id: participation.id!,
        arrivalTime: value.arrivalTime
          ? new Date(value.arrivalTime).toISOString()
          : null,
      });
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
            name="arrivalTime"
            validators={{
              onChange: ({ value }) => {
                const r = z
                  .string()
                  .min(1, "Heure d'arrivee requise")
                  .safeParse(value);
                return r.success ? undefined : r.error.issues[0].message;
              },
            }}
          >
            {(field) => (
              <Field.Root required invalid={!!field.state.meta.errors.length}>
                <Field.Label>Heure d&apos;arrivee</Field.Label>
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
          Modifier
        </Button>
      </Dialog.Footer>
    </form>
  );
}

// ---------------------------------------------------------------------------
// RunDetailPage
// ---------------------------------------------------------------------------

export default function RunDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const runId = Number(id);

  const { data: run, isLoading: runLoading } = useAdminRunQuery(runId);
  const { data: participationsData, isLoading: participationsLoading } =
    useAdminRunParticipationsQuery(runId);

  const deleteMutation = useDeleteParticipationMutation();

  const [editParticipation, setEditParticipation] = useState<
    AdminParticipation | undefined
  >(undefined);
  const [deleteParticipation, setDeleteParticipation] = useState<
    AdminParticipation | undefined
  >(undefined);

  const participations = participationsData?.member ?? [];

  // Computed stats from finished participations
  const finishedTimes = participations
    .filter((p) => p.totalTime != null && p.status === "FINISHED")
    .map((p) => p.totalTime!);
  const fastestTime =
    finishedTimes.length > 0 ? Math.min(...finishedTimes) : null;
  const averageTime =
    finishedTimes.length > 0
      ? Math.round(
          finishedTimes.reduce((a, b) => a + b, 0) / finishedTimes.length,
        )
      : null;

  // Helpers
  const formatDate = (iso?: string | null) =>
    iso ? new Date(iso).toLocaleString("fr-FR") : "-";

  const formatUserName = (p: AdminParticipation) => {
    const first = p.user?.firstName ?? "";
    const last = p.user?.lastName ?? "";
    const full = `${first} ${last}`.trim();
    return full || "-";
  };

  const handleConfirmDelete = async () => {
    if (deleteParticipation?.id) {
      await deleteMutation.mutateAsync(deleteParticipation.id);
    }
    setDeleteParticipation(undefined);
  };

  // Loading state
  if (runLoading) {
    return (
      <Box display="flex" justifyContent="center" py="16">
        <Spinner size="xl" color="primary.500" />
      </Box>
    );
  }

  // Not found
  if (!run) {
    return (
      <VStack gap="4" py="16" align="center">
        <Text color="fg.muted">Run introuvable.</Text>
        <Link href="/admin/runs">
          <Button variant="outline" size="sm">
            Retour a la liste
          </Button>
        </Link>
      </VStack>
    );
  }

  // Column definitions for participations table
  const columns: Column<AdminParticipation>[] = [
    {
      key: "id",
      header: "#",
      render: (p) => p.id ?? "-",
      width: "60px",
    },
    {
      key: "user",
      header: "Participant",
      render: (p) => {
        const name = formatUserName(p);
        return (
          <VStack align="flex-start" gap="0">
            {p.user?.id ? (
              <Link href={`/admin/users/${p.user.id}`}>
                <Text
                  fontWeight="medium"
                  color="primary.fg"
                  _hover={{ textDecoration: "underline" }}
                  cursor="pointer"
                >
                  {name}
                </Text>
              </Link>
            ) : (
              <Text fontWeight="medium">{name}</Text>
            )}
            {p.user?.surname && (
              <Text fontSize="xs" color="fg.muted">
                {p.user.surname}
              </Text>
            )}
          </VStack>
        );
      },
    },
    {
      key: "status",
      header: "Statut",
      render: (p) => {
        const status = p.status ?? "unknown";
        const colorMap: Record<string, string> = {
          in_progress: "orange",
          finished: "green",
          dns: "gray",
          dnf: "red",
        };
        const labelMap: Record<string, string> = {
          in_progress: "En cours",
          finished: "Termine",
          dns: "DNS",
          dnf: "DNF",
        };
        return (
          <Badge colorPalette={colorMap[status] ?? "gray"}>
            {labelMap[status] ?? status}
          </Badge>
        );
      },
      width: "120px",
    },
    {
      key: "arrivalTime",
      header: "Arrivee",
      render: (p) => formatDate(p.arrivalTime),
    },
    {
      key: "totalTime",
      header: "Temps total",
      render: (p) => {
        if (p.totalTime == null) return "-";
        const mins = Math.floor(p.totalTime / 60);
        const secs = p.totalTime % 60;
        return `${mins}m ${secs.toFixed(0)}s`;
      },
      width: "120px",
    },
    {
      key: "actions",
      header: "",
      width: "100px",
      render: (p) => (
        <HStack gap="1">
          <IconButton
            size="sm"
            variant="ghost"
            aria-label="Modifier l'heure d'arrivee"
            onClick={() => setEditParticipation(p)}
          >
            <LuPencil />
          </IconButton>
          <IconButton
            size="sm"
            variant="ghost"
            colorPalette="red"
            aria-label="Supprimer la participation"
            onClick={() => setDeleteParticipation(p)}
          >
            <LuTrash2 />
          </IconButton>
        </HStack>
      ),
    },
  ];

  return (
    <VStack align="stretch" gap="6">
      {/* Breadcrumb */}
      <HStack>
        <Link href="/admin/runs">
          <Button variant="ghost" size="sm" colorPalette="primary">
            Runs
          </Button>
        </Link>
        <Text color="fg.muted" fontSize="sm">
          /
        </Text>
        <Text fontSize="sm" fontWeight="medium">
          Run #{run.id}
        </Text>
      </HStack>

      {/* Header card */}
      <Card.Root variant="outline" shadow="sm" borderColor="border.subtle">
        <Card.Body p="6">
          <HStack
            justify="space-between"
            align="flex-start"
            flexWrap="wrap"
            gap="4"
          >
            <VStack align="flex-start" gap="2">
              <Heading size="xl">Run #{run.id}</Heading>
              <Text color="fg.muted" fontSize="sm">
                Debut :{" "}
                <Text as="span" fontWeight="medium" color="fg">
                  {formatDate(run.startDate)}
                </Text>
              </Text>
              <Text color="fg.muted" fontSize="sm">
                Fin :{" "}
                <Text as="span" fontWeight="medium" color="fg">
                  {formatDate(run.endDate)}
                </Text>
              </Text>
            </VStack>

            <Button variant="outline" size="sm" disabled>
              Ajouter un participant
            </Button>
          </HStack>
        </Card.Body>
      </Card.Root>

      {/* Stats */}
      <SimpleGrid columns={{ base: 2, sm: 3, lg: 6 }} gap="4">
        <StatCard
          label="Participants"
          value={run.participantsCount ?? 0}
          icon={LuUsers}
          color="stat.blue"
          loading={runLoading}
          index={0}
        />
        <StatCard
          label="En cours"
          value={run.inProgressParticipantsCount ?? 0}
          icon={LuPlay}
          color="stat.orange"
          loading={runLoading}
          index={1}
        />
        <StatCard
          label="Terminés"
          value={run.finishedParticipantsCount ?? 0}
          icon={LuCircleCheck}
          color="stat.green"
          loading={runLoading}
          index={2}
        />
        <StatCard
          label="Plus rapide"
          value={formatTime(fastestTime)}
          icon={LuZap}
          color="stat.green"
          loading={participationsLoading}
          index={3}
        />
        <StatCard
          label="Temps moyen"
          value={formatTime(averageTime)}
          icon={LuTimer}
          color="stat.orange"
          loading={participationsLoading}
          index={4}
        />
        <StatCard
          label="Allure moy."
          value={
            averageTime
              ? `${Math.floor(averageTime / 60)}:${String(averageTime % 60).padStart(2, "0")}/tour`
              : "-"
          }
          icon={LuGauge}
          color="primary.500"
          loading={participationsLoading}
          index={5}
        />
      </SimpleGrid>

      {/* Participations table */}
      <VStack align="stretch" gap="3">
        <Heading size="md">Participations</Heading>
        <DataTable<AdminParticipation>
          columns={columns}
          data={participations}
          isLoading={participationsLoading}
          keyExtractor={(p) => p.id ?? Math.random()}
          emptyMessage="Aucune participation pour ce run"
        />
      </VStack>

      {/* Edit arrivalTime dialog */}
      <Dialog.Root
        open={!!editParticipation}
        onOpenChange={({ open }) => !open && setEditParticipation(undefined)}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="md">
              <Dialog.Header>
                <Dialog.Title>
                  Modifier l&apos;heure d&apos;arrivee
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
              {editParticipation && (
                <EditArrivalTimeForm
                  participation={editParticipation}
                  onClose={() => setEditParticipation(undefined)}
                />
              )}
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteParticipation}
        onClose={() => setDeleteParticipation(undefined)}
        onConfirm={handleConfirmDelete}
        title="Supprimer la participation"
        description={
          deleteParticipation
            ? `Etes-vous sur de vouloir supprimer la participation de ${formatUserName(deleteParticipation)} ? Cette action est irreversible.`
            : ""
        }
        loading={deleteMutation.isPending}
      />
    </VStack>
  );
}
