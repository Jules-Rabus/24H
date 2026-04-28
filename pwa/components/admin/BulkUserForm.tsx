"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Dialog,
  HStack,
  IconButton,
  Input,
  Progress,
  Spinner,
  Table,
  Text,
  VStack,
} from "@chakra-ui/react";
import { LuTrash2, LuPlus } from "react-icons/lu";
import {
  useAdminUsersQuery,
  type AdminUser,
} from "@/state/admin/users/queries";
import {
  useAddUserToCurrentRunMutation,
  useCreateUserMutation,
} from "@/state/admin/users/mutations";
import { useDebounce } from "@/hooks/useDebounce";
import { toaster } from "@/components/ui/toaster";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BulkRow {
  /** Stable client-side identifier for React keys. */
  uid: string;
  firstName: string;
  lastName: string;
  surname: string;
  email: string;
  organization: string;
  /**
   * Whether the user explicitly asked to link the existing match
   * to the current run instead of creating a new user.
   */
  linkExistingId?: number | null;
  /** Mark a row as already saved during this session. */
  saved?: boolean;
}

type RowStatus =
  | { kind: "empty" }
  | { kind: "incomplete" }
  | { kind: "duplicateInList" }
  | { kind: "checking" }
  | { kind: "existing"; existingId: number; existing: AdminUser }
  | { kind: "ok" }
  | { kind: "saved" };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const norm = (s: string) => s.trim().toLowerCase();

let rowCounter = 0;
const newRow = (): BulkRow => {
  rowCounter += 1;
  return {
    uid: `bulk-row-${Date.now()}-${rowCounter}`,
    firstName: "",
    lastName: "",
    surname: "",
    email: "",
    organization: "",
    linkExistingId: null,
    saved: false,
  };
};

const initialRows = (): BulkRow[] => Array.from({ length: 5 }, () => newRow());

// ---------------------------------------------------------------------------
// Duplicate lookup (one row at a time)
// ---------------------------------------------------------------------------

interface DuplicateLookupProps {
  firstName: string;
  lastName: string;
  onResult: (match: AdminUser | null) => void;
  onLoading: (loading: boolean) => void;
}

/**
 * Hidden helper component that issues an `useAdminUsersQuery` for one row
 * (debounced firstName/lastName) and reports the exact match — if any —
 * back to the parent. Rendered once per filled row so the React Query cache
 * naturally deduplicates identical lookups.
 */
function DuplicateLookup({
  firstName,
  lastName,
  onResult,
  onLoading,
}: DuplicateLookupProps) {
  const debouncedFirst = useDebounce(firstName, 400);
  const debouncedLast = useDebounce(lastName, 400);

  const enabled =
    debouncedFirst.trim().length >= 2 && debouncedLast.trim().length >= 2;

  const { data, isFetching } = useAdminUsersQuery(
    enabled
      ? {
          firstName: debouncedFirst.trim(),
          lastName: debouncedLast.trim(),
          itemsPerPage: 5,
        }
      : {},
  );

  useEffect(() => {
    onLoading(enabled && isFetching);
  }, [enabled, isFetching, onLoading]);

  useEffect(() => {
    if (!enabled) {
      onResult(null);
      return;
    }
    if (isFetching) return;
    const fn = norm(debouncedFirst);
    const ln = norm(debouncedLast);
    const match =
      data?.member?.find(
        (u) => norm(u.firstName) === fn && norm(u.lastName) === ln,
      ) ?? null;
    onResult(match);
  }, [enabled, isFetching, data, debouncedFirst, debouncedLast, onResult]);

  return null;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function BulkUserForm({ onClose }: { onClose: () => void }) {
  const [rows, setRows] = useState<BulkRow[]>(() => initialRows());
  const [apiMatches, setApiMatches] = useState<
    Record<string, AdminUser | null>
  >({});
  const [apiLoading, setApiLoading] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  const createMutation = useCreateUserMutation();
  const linkMutation = useAddUserToCurrentRunMutation();

  // ------------------------------------------------------------------
  // Mutators
  // ------------------------------------------------------------------

  const updateRow = useCallback(
    (uid: string, patch: Partial<BulkRow>) => {
      setRows((prev) =>
        prev.map((r) => (r.uid === uid ? { ...r, ...patch } : r)),
      );
    },
    [setRows],
  );

  const addRow = useCallback(() => {
    setRows((prev) => [...prev, newRow()]);
  }, []);

  const removeRow = useCallback((uid: string) => {
    setRows((prev) => {
      const next = prev.filter((r) => r.uid !== uid);
      return next.length === 0 ? [newRow()] : next;
    });
    setApiMatches((prev) => {
      const { [uid]: _omit, ...rest } = prev;
      void _omit;
      return rest;
    });
    setApiLoading((prev) => {
      const { [uid]: _omit, ...rest } = prev;
      void _omit;
      return rest;
    });
  }, []);

  const handleApiMatch = useCallback(
    (uid: string) => (match: AdminUser | null) =>
      setApiMatches((prev) =>
        prev[uid] === match ? prev : { ...prev, [uid]: match },
      ),
    [],
  );

  const handleApiLoading = useCallback(
    (uid: string) => (loading: boolean) =>
      setApiLoading((prev) =>
        prev[uid] === loading ? prev : { ...prev, [uid]: loading },
      ),
    [],
  );

  // ------------------------------------------------------------------
  // In-list duplicate detection
  // ------------------------------------------------------------------

  const inListDuplicates = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of rows) {
      if (!r.firstName.trim() || !r.lastName.trim()) continue;
      const key = `${norm(r.firstName)}|${norm(r.lastName)}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  }, [rows]);

  const isInListDuplicate = useCallback(
    (row: BulkRow) => {
      if (!row.firstName.trim() || !row.lastName.trim()) return false;
      const key = `${norm(row.firstName)}|${norm(row.lastName)}`;
      return (inListDuplicates.get(key) ?? 0) > 1;
    },
    [inListDuplicates],
  );

  // ------------------------------------------------------------------
  // Per-row status
  // ------------------------------------------------------------------

  const rowStatus = useCallback(
    (row: BulkRow): RowStatus => {
      if (row.saved) return { kind: "saved" };
      const fn = row.firstName.trim();
      const ln = row.lastName.trim();
      const isEmpty =
        !fn &&
        !ln &&
        !row.surname.trim() &&
        !row.email.trim() &&
        !row.organization.trim();
      if (isEmpty) return { kind: "empty" };
      if (!fn || !ln) return { kind: "incomplete" };
      if (isInListDuplicate(row)) return { kind: "duplicateInList" };
      if (apiLoading[row.uid]) return { kind: "checking" };
      const match = apiMatches[row.uid];
      if (match && match.id != null) {
        return { kind: "existing", existingId: match.id, existing: match };
      }
      return { kind: "ok" };
    },
    [apiLoading, apiMatches, isInListDuplicate],
  );

  // ------------------------------------------------------------------
  // Derived flags
  // ------------------------------------------------------------------

  const statusEntries = useMemo(
    () => rows.map((r) => ({ row: r, status: rowStatus(r) })),
    [rows, rowStatus],
  );

  const savableCount = useMemo(
    () =>
      statusEntries.filter(
        ({ row, status }) =>
          !row.saved &&
          (status.kind === "ok" ||
            (status.kind === "existing" &&
              row.linkExistingId === status.existingId)),
      ).length,
    [statusEntries],
  );

  const hasBlockingError = useMemo(
    () =>
      statusEntries.some(
        ({ row, status }) =>
          !row.saved &&
          (status.kind === "duplicateInList" ||
            status.kind === "incomplete" ||
            (status.kind === "existing" &&
              row.linkExistingId !== status.existingId)),
      ),
    [statusEntries],
  );

  const isBusy = !!progress;

  // ------------------------------------------------------------------
  // Keyboard navigation
  // ------------------------------------------------------------------

  const handleEnterOnLastCol = useCallback(
    (rowUid: string) => {
      const idx = rows.findIndex((r) => r.uid === rowUid);
      if (idx === -1) return;
      if (idx === rows.length - 1) {
        addRow();
        // Focus the next row's first input on the next tick.
        setTimeout(() => {
          const inputs = document.querySelectorAll<HTMLInputElement>(
            'input[data-bulk-col="firstName"]',
          );
          inputs[inputs.length - 1]?.focus();
        }, 0);
      } else {
        const nextRowUid = rows[idx + 1].uid;
        setTimeout(() => {
          document
            .querySelector<HTMLInputElement>(
              `input[data-bulk-row="${nextRowUid}"][data-bulk-col="firstName"]`,
            )
            ?.focus();
        }, 0);
      }
    },
    [rows, addRow],
  );

  // ------------------------------------------------------------------
  // Save all
  // ------------------------------------------------------------------

  const handleSaveAll = async () => {
    const targets = statusEntries.filter(
      ({ row, status }) =>
        !row.saved &&
        (status.kind === "ok" ||
          (status.kind === "existing" &&
            row.linkExistingId === status.existingId)),
    );
    if (targets.length === 0) return;

    setProgress({ current: 0, total: targets.length });
    let okCount = 0;
    let errCount = 0;

    for (let i = 0; i < targets.length; i++) {
      const { row, status } = targets[i];
      try {
        if (status.kind === "ok") {
          await createMutation.mutateAsync({
            firstName: row.firstName.trim(),
            lastName: row.lastName.trim(),
            surname: row.surname.trim() || null,
            email: row.email.trim() || null,
            organization: row.organization.trim() || null,
            roles: ["ROLE_USER"],
            plainPassword: null,
          });
        } else if (status.kind === "existing") {
          await linkMutation.mutateAsync(status.existingId);
        }
        okCount += 1;
        setRows((prev) =>
          prev.map((r) => (r.uid === row.uid ? { ...r, saved: true } : r)),
        );
      } catch (e) {
        errCount += 1;
        toaster.create({
          type: "error",
          title: `Erreur ligne ${row.firstName} ${row.lastName}`,
          description: e instanceof Error ? e.message : undefined,
        });
      }
      setProgress({ current: i + 1, total: targets.length });
    }

    toaster.create({
      type: errCount === 0 ? "success" : "warning",
      title:
        errCount === 0
          ? `${okCount} coureur${okCount > 1 ? "s" : ""} enregistré${okCount > 1 ? "s" : ""}`
          : `${okCount} OK / ${errCount} erreur${errCount > 1 ? "s" : ""}`,
    });

    setProgress(null);
    if (errCount === 0) onClose();
  };

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  return (
    <>
      <Dialog.Body>
        <VStack align="stretch" gap="4">
          <Text color="fg.muted" fontSize="sm">
            Saisis plusieurs coureurs à la fois. Le statut de chaque ligne se
            met à jour automatiquement&nbsp;: doublon dans la liste, coureur
            déjà existant en base, ou prêt à enregistrer.
          </Text>

          {/* Hidden duplicate lookup workers */}
          {rows.map((row) => (
            <DuplicateLookup
              key={`lookup-${row.uid}`}
              firstName={row.firstName}
              lastName={row.lastName}
              onResult={handleApiMatch(row.uid)}
              onLoading={handleApiLoading(row.uid)}
            />
          ))}

          <Box overflowX="auto">
            <Table.Root size="sm" variant="outline">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader minW="160px">Prénom*</Table.ColumnHeader>
                  <Table.ColumnHeader minW="160px">Nom*</Table.ColumnHeader>
                  <Table.ColumnHeader minW="140px">Surnom</Table.ColumnHeader>
                  <Table.ColumnHeader minW="200px">Email</Table.ColumnHeader>
                  <Table.ColumnHeader minW="160px">
                    Organisation
                  </Table.ColumnHeader>
                  <Table.ColumnHeader minW="200px">Statut</Table.ColumnHeader>
                  <Table.ColumnHeader width="60px" />
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {rows.map((row) => {
                  const status = rowStatus(row);
                  return (
                    <Table.Row key={row.uid}>
                      <Table.Cell>
                        <Input
                          size="sm"
                          value={row.firstName}
                          data-bulk-row={row.uid}
                          data-bulk-col="firstName"
                          aria-label="Prénom"
                          disabled={row.saved || isBusy}
                          onChange={(e) =>
                            updateRow(row.uid, {
                              firstName: e.target.value,
                              linkExistingId: null,
                            })
                          }
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <Input
                          size="sm"
                          value={row.lastName}
                          data-bulk-row={row.uid}
                          data-bulk-col="lastName"
                          aria-label="Nom"
                          disabled={row.saved || isBusy}
                          onChange={(e) =>
                            updateRow(row.uid, {
                              lastName: e.target.value,
                              linkExistingId: null,
                            })
                          }
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <Input
                          size="sm"
                          value={row.surname}
                          data-bulk-row={row.uid}
                          data-bulk-col="surname"
                          aria-label="Surnom"
                          disabled={row.saved || isBusy}
                          onChange={(e) =>
                            updateRow(row.uid, { surname: e.target.value })
                          }
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <Input
                          size="sm"
                          type="email"
                          value={row.email}
                          data-bulk-row={row.uid}
                          data-bulk-col="email"
                          aria-label="Email"
                          disabled={row.saved || isBusy}
                          onChange={(e) =>
                            updateRow(row.uid, { email: e.target.value })
                          }
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <Input
                          size="sm"
                          value={row.organization}
                          data-bulk-row={row.uid}
                          data-bulk-col="organization"
                          aria-label="Organisation"
                          disabled={row.saved || isBusy}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleEnterOnLastCol(row.uid);
                            }
                          }}
                          onChange={(e) =>
                            updateRow(row.uid, {
                              organization: e.target.value,
                            })
                          }
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <RowStatusBadge
                          status={status}
                          row={row}
                          onLink={(id) =>
                            updateRow(row.uid, { linkExistingId: id })
                          }
                          onUnlink={() =>
                            updateRow(row.uid, { linkExistingId: null })
                          }
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <IconButton
                          size="sm"
                          variant="ghost"
                          colorPalette="red"
                          aria-label="Supprimer la ligne"
                          disabled={isBusy}
                          onClick={() => removeRow(row.uid)}
                        >
                          <LuTrash2 />
                        </IconButton>
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table.Root>
          </Box>

          <HStack>
            <Button
              size="sm"
              variant="outline"
              onClick={addRow}
              disabled={isBusy}
              type="button"
            >
              <LuPlus /> Ajouter une ligne
            </Button>
            <Text fontSize="sm" color="fg.muted">
              {savableCount} ligne{savableCount > 1 ? "s" : ""} prête
              {savableCount > 1 ? "s" : ""} à enregistrer
            </Text>
          </HStack>

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
                {progress.current} / {progress.total} enregistrés
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
          disabled={isBusy}
        >
          Fermer
        </Button>
        <Button
          colorPalette="primary"
          onClick={handleSaveAll}
          loading={isBusy}
          disabled={isBusy || hasBlockingError || savableCount === 0}
          type="button"
        >
          Tout enregistrer
        </Button>
      </Dialog.Footer>
    </>
  );
}

// ---------------------------------------------------------------------------
// Status badge cell
// ---------------------------------------------------------------------------

interface RowStatusBadgeProps {
  status: RowStatus;
  row: BulkRow;
  onLink: (id: number) => void;
  onUnlink: () => void;
}

function RowStatusBadge({
  status,
  row,
  onLink,
  onUnlink,
}: RowStatusBadgeProps) {
  switch (status.kind) {
    case "saved":
      return <Badge colorPalette="green">Enregistré</Badge>;
    case "empty":
      return (
        <Text fontSize="xs" color="fg.muted">
          —
        </Text>
      );
    case "incomplete":
      return <Badge colorPalette="gray">Champs requis manquants</Badge>;
    case "duplicateInList":
      return <Badge colorPalette="red">Doublon dans la liste</Badge>;
    case "checking":
      return (
        <HStack gap="2">
          <Spinner size="xs" />
          <Text fontSize="xs" color="fg.muted">
            Vérification…
          </Text>
        </HStack>
      );
    case "existing": {
      const isLinked = row.linkExistingId === status.existingId;
      return (
        <VStack align="stretch" gap="1">
          <Badge colorPalette="orange">
            Existe déjà (#{status.existingId})
          </Badge>
          {isLinked ? (
            <Button
              size="xs"
              variant="outline"
              type="button"
              onClick={onUnlink}
            >
              Annuler le lien
            </Button>
          ) : (
            <Button
              size="xs"
              colorPalette="primary"
              type="button"
              onClick={() => onLink(status.existingId)}
            >
              Lier au coureur 2026
            </Button>
          )}
        </VStack>
      );
    }
    case "ok":
      return <Badge colorPalette="green">OK</Badge>;
  }
}
