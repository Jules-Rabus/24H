"use client";

import { use, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Badge,
  Box,
  Button,
  Card,
  Dialog,
  Heading,
  HStack,
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
  LuUser,
  LuCamera,
  LuTrophy,
  LuMapPin,
  LuTimer,
  LuGauge,
  LuActivity,
} from "react-icons/lu";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const BibDownloadButton = dynamic(
  () => import("@/components/classement/BibDownloadButton"),
  { ssr: false },
);
import { useForm } from "@tanstack/react-form";
import { useAdminUserQuery, type AdminUser } from "@/state/admin/users/queries";
import { editUserSchema } from "@/state/admin/users/schemas";
import {
  useAdminUserParticipationsQuery,
  type AdminParticipation,
} from "@/state/admin/participations/queries";
import {
  useUpdateUserMutation,
  useDeleteUserMutation,
  useUploadUserImageMutation,
  useDeleteUserImageMutation,
} from "@/state/admin/users/mutations";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { StatCard } from "@/components/admin/ui/StatCard";
import { DataTable, type Column } from "@/components/admin/ui/DataTable";
import { formatTimeVerbose as formatTime, formatPace } from "@/utils/race";

// ---------------------------------------------------------------------------
// UserForm (inline, edit only on this detail page)
// ---------------------------------------------------------------------------

import { Checkbox, Field, Input } from "@chakra-ui/react";

function UserForm({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const updateMutation = useUpdateUserMutation();

  const isLoading = updateMutation.isPending;

  const form = useForm({
    defaultValues: {
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      surname: user.surname ?? "",
      email: user.email ?? "",
      organization: user.organization ?? "",
      isAdmin: user.roles?.includes("ROLE_ADMIN") ?? false,
    },
    validators: {
      onChange: editUserSchema,
    },
    onSubmit: async ({ value }) => {
      const roles: string[] = value.isAdmin
        ? ["ROLE_USER", "ROLE_ADMIN"]
        : ["ROLE_USER"];

      await updateMutation.mutateAsync({
        id: user.id!,
        body: {
          firstName: value.firstName,
          lastName: value.lastName,
          surname: value.surname || null,
          email: value.email || null,
          organization: value.organization || null,
          roles,
        },
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
          <form.Field name="firstName">
            {(field) => (
              <Field.Root required invalid={!!field.state.meta.errors.length}>
                <Field.Label>Prénom</Field.Label>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Prénom"
                />
                <Field.ErrorText>
                  {field.state.meta.errors[0]?.message}
                </Field.ErrorText>
              </Field.Root>
            )}
          </form.Field>

          <form.Field name="lastName">
            {(field) => (
              <Field.Root required invalid={!!field.state.meta.errors.length}>
                <Field.Label>Nom</Field.Label>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Nom"
                />
                <Field.ErrorText>
                  {field.state.meta.errors[0]?.message}
                </Field.ErrorText>
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

          <form.Field name="email">
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
                <Field.ErrorText>
                  {field.state.meta.errors[0]?.message}
                </Field.ErrorText>
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
        <form.Subscribe selector={(s) => s.canSubmit}>
          {(canSubmit) => (
            <Button
              type="submit"
              colorPalette="primary"
              loading={isLoading}
              disabled={!canSubmit}
            >
              Modifier
            </Button>
          )}
        </form.Subscribe>
      </Dialog.Footer>
    </form>
  );
}

// ---------------------------------------------------------------------------
// UserDetailPage
// ---------------------------------------------------------------------------

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const userId = Number(id);
  const router = useRouter();

  const { data: user, isLoading } = useAdminUserQuery(userId);
  const { data: participationsData, isLoading: isLoadingParticipations } =
    useAdminUserParticipationsQuery(userId);
  const uploadImageMutation = useUploadUserImageMutation();
  const deleteImageMutation = useDeleteUserImageMutation();
  const deleteUserMutation = useDeleteUserMutation();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteImageOpen, setDeleteImageOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chart data: pace per participation (finished only, sorted by run date)
  const chartData = useMemo(() => {
    const participations = participationsData?.member ?? [];
    return participations
      .filter((p) => p.totalTime != null && p.status === "FINISHED")
      .sort((a, b) => {
        const da = a.run?.startDate ? new Date(a.run.startDate).getTime() : 0;
        const db = b.run?.startDate ? new Date(b.run.startDate).getTime() : 0;
        return da - db;
      })
      .map((p, i) => ({
        name: `Tour ${i + 1}`,
        minutes: Math.round((p.totalTime! / 60) * 100) / 100,
        minPerKm: Math.round((p.totalTime! / 60 / 4) * 100) / 100,
      }));
  }, [participationsData?.member]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadImageMutation.mutateAsync({ userId, file });
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleConfirmDelete = async () => {
    await deleteUserMutation.mutateAsync(userId);
    router.push("/admin/users");
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py="16">
        <Spinner size="xl" color="primary.500" />
      </Box>
    );
  }

  if (!user) {
    return (
      <VStack gap="4" py="16" align="center">
        <Text color="fg.muted">Utilisateur introuvable.</Text>
        <Link href="/admin/users">
          <Button variant="outline" size="sm">
            ← Retour à la liste
          </Button>
        </Link>
      </VStack>
    );
  }

  const fullName =
    `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "—";
  const isAdmin = user.roles?.includes("ROLE_ADMIN") ?? false;
  const finishedRuns = user.finishedParticipationsCount ?? 0;
  const distance = finishedRuns * 4;

  // image is a VichUploader resolved URI (e.g. "/media/images/photo.jpg")
  const imageUrl = user.image
    ? `${process.env.NEXT_PUBLIC_ENTRYPOINT ?? ""}${user.image}`
    : null;

  const participationColumns: Column<AdminParticipation>[] = [
    {
      key: "run",
      header: "Run",
      render: (row) =>
        row.run?.id ? (
          <HStack gap="2">
            <Link href={`/admin/runs/${row.run.id}`}>
              <Text
                fontWeight="medium"
                color="primary.fg"
                _hover={{ textDecoration: "underline" }}
                cursor="pointer"
              >
                Run #{row.run.id}
              </Text>
            </Link>
            {row.run.edition != null && (
              <Badge colorPalette="primary" size="sm">
                {row.run.edition}
              </Badge>
            )}
          </HStack>
        ) : (
          <Text>-</Text>
        ),
      width: "160px",
    },
    {
      key: "runDate",
      header: "Date du run",
      render: (row) =>
        row.run?.startDate ? (
          <Text fontSize="sm">
            {new Date(row.run.startDate).toLocaleString("fr-FR", {
              dateStyle: "short",
              timeStyle: "short",
            })}
          </Text>
        ) : (
          <Text color="fg.muted">-</Text>
        ),
    },
    {
      key: "arrivalTime",
      header: "Heure d'arrivée",
      render: (row) =>
        row.arrivalTime ? (
          <Text fontSize="sm">
            {new Date(row.arrivalTime).toLocaleString("fr-FR", {
              dateStyle: "short",
              timeStyle: "short",
            })}
          </Text>
        ) : (
          <Text color="fg.muted">-</Text>
        ),
    },
    {
      key: "totalTime",
      header: "Temps total",
      render: (row) => (
        <Text fontFamily="mono" fontSize="sm">
          {formatTime(row.totalTime)}
        </Text>
      ),
      width: "120px",
    },
    {
      key: "pace",
      header: "Allure (min/km)",
      render: (row) => (
        <Text fontFamily="mono" fontSize="sm">
          {formatPace(row.totalTime)}
        </Text>
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
      width: "110px",
    },
  ];

  return (
    <VStack align="stretch" gap="6">
      {/* Breadcrumb / back */}
      <HStack>
        <Link href="/admin/users">
          <Button variant="ghost" size="sm" colorPalette="primary">
            ← Utilisateurs
          </Button>
        </Link>
      </HStack>

      {/* Header */}
      <Card.Root variant="outline" shadow="sm" borderColor="border.subtle">
        <Card.Body p="6">
          <HStack
            justify="space-between"
            align="flex-start"
            flexWrap="wrap"
            gap="4"
          >
            <VStack align="flex-start" gap="2">
              <HStack gap="3" align="center">
                <Heading size="xl">{fullName}</Heading>
                <Badge colorPalette={isAdmin ? "purple" : "gray"} size="lg">
                  {isAdmin ? "Admin" : "Utilisateur"}
                </Badge>
              </HStack>
              {user.surname && (
                <Text color="fg.muted" fontSize="sm">
                  Surnom :{" "}
                  <Text as="span" fontWeight="medium" color="fg">
                    {user.surname}
                  </Text>
                </Text>
              )}
              {user.email && (
                <Text color="fg.muted" fontSize="sm">
                  Email :{" "}
                  <Text as="span" fontWeight="medium" color="fg">
                    {user.email}
                  </Text>
                </Text>
              )}
              {user.organization && (
                <Text color="fg.muted" fontSize="sm">
                  Organisation :{" "}
                  <Text as="span" fontWeight="medium" color="fg">
                    {user.organization}
                  </Text>
                </Text>
              )}
              <Text color="fg.muted" fontSize="xs">
                ID : {user.id ?? "—"}
              </Text>
            </VStack>

            <HStack gap="2" flexWrap="wrap">
              {user.id && user.firstName && user.lastName && (
                <BibDownloadButton
                  user={{
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    surname: user.surname,
                  }}
                />
              )}
              <Button
                colorPalette="primary"
                variant="outline"
                size="sm"
                onClick={() => setEditOpen(true)}
              >
                <LuPencil /> Modifier
              </Button>
              <Button
                colorPalette="red"
                variant="outline"
                size="sm"
                onClick={() => setDeleteOpen(true)}
              >
                <LuTrash2 /> Supprimer
              </Button>
            </HStack>
          </HStack>
        </Card.Body>
      </Card.Root>

      {/* Stats */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="4">
        <StatCard
          label="Runs terminés"
          value={finishedRuns}
          icon={LuTrophy}
          color="stat.green"
          index={0}
        />
        <StatCard
          label="Distance totale"
          value={`${distance} km`}
          icon={LuMapPin}
          color="stat.blue"
          index={1}
        />
        <StatCard
          label="Meilleur temps"
          value={formatTime(user.bestTime)}
          icon={LuTimer}
          color="stat.orange"
          index={2}
        />
        <StatCard
          label="Allure moyenne"
          value={formatTime(user.averageTime)}
          icon={LuGauge}
          color="primary.500"
          index={3}
        />
      </SimpleGrid>

      {/* Pace chart */}
      {chartData.length >= 2 && (
        <Card.Root variant="outline" shadow="sm" borderColor="border.subtle">
          <Card.Body p="6">
            <HStack mb="4" gap="2" align="center">
              <LuActivity size={16} />
              <Text
                fontSize="xs"
                color="fg.muted"
                textTransform="uppercase"
                letterSpacing="wider"
                fontWeight="semibold"
              >
                Rythme par tour (min/km)
              </Text>
            </HStack>
            <Box h="250px">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    dataKey="name"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) =>
                      `${Math.floor(v)}:${String(Math.round((v % 1) * 60)).padStart(2, "0")}`
                    }
                  />
                  <Tooltip
                    formatter={(value) => {
                      const v = Number(value);
                      return [
                        `${Math.floor(v)}:${String(Math.round((v % 1) * 60)).padStart(2, "0")} min/km`,
                        "Allure",
                      ];
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="minPerKm"
                    stroke="#0f929a"
                    strokeWidth={2}
                    dot={{ fill: "#0f929a", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Card.Body>
        </Card.Root>
      )}

      {/* Image section */}
      <Card.Root variant="outline" shadow="sm" borderColor="border.subtle">
        <Card.Body p="6">
          <Text
            fontSize="xs"
            color="fg.muted"
            textTransform="uppercase"
            letterSpacing="wider"
            fontWeight="semibold"
            mb="4"
          >
            Photo de profil
          </Text>

          <HStack gap="6" align="flex-start" flexWrap="wrap">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={`Photo de ${fullName}`}
                style={{
                  width: "120px",
                  height: "120px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  border: "1px solid var(--chakra-colors-border-subtle)",
                }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <Box
                boxSize="120px"
                rounded="lg"
                bg="bg.subtle"
                borderWidth="1px"
                borderColor="border.subtle"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <LuUser size={32} />
              </Box>
            )}

            <VStack align="flex-start" gap="2">
              {user.image && (
                <Text fontSize="xs" color="fg.muted">
                  IRI : {user.image}
                </Text>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageUpload}
              />
              <HStack gap="2">
                <Button
                  size="sm"
                  variant="outline"
                  colorPalette="primary"
                  loading={uploadImageMutation.isPending}
                  loadingText="Envoi…"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <LuCamera />{" "}
                  {user.image ? "Changer l'image" : "Ajouter une image"}
                </Button>
                {user.image && (
                  <Button
                    size="sm"
                    variant="outline"
                    colorPalette="red"
                    onClick={() => setDeleteImageOpen(true)}
                  >
                    <LuTrash2 /> Supprimer l&apos;image
                  </Button>
                )}
              </HStack>
            </VStack>
          </HStack>
        </Card.Body>
      </Card.Root>

      {/* Participations table */}
      <Card.Root variant="outline" shadow="sm" borderColor="border.subtle">
        <Card.Body p="6">
          <Text
            fontSize="xs"
            color="fg.muted"
            textTransform="uppercase"
            letterSpacing="wider"
            fontWeight="semibold"
            mb="4"
          >
            Participations ({participationsData?.totalItems ?? 0})
          </Text>
          <DataTable<AdminParticipation>
            columns={participationColumns}
            data={participationsData?.member ?? []}
            isLoading={isLoadingParticipations}
            keyExtractor={(row) => row.id ?? Math.random()}
            page={1}
            totalItems={participationsData?.totalItems ?? 0}
            itemsPerPage={200}
            onPageChange={() => {}}
            emptyMessage="Aucune participation"
          />
        </Card.Body>
      </Card.Root>

      {/* Edit dialog */}
      <Dialog.Root
        open={editOpen}
        onOpenChange={({ open }) => !open && setEditOpen(false)}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="md">
              <Dialog.Header>
                <Dialog.Title>Modifier l&apos;utilisateur</Dialog.Title>
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
              <UserForm user={user} onClose={() => setEditOpen(false)} />
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Supprimer l'utilisateur"
        description={`Êtes-vous sûr de vouloir supprimer ${fullName} ? Cette action est irréversible.`}
        loading={deleteUserMutation.isPending}
      />

      {/* Delete image confirmation */}
      <ConfirmDialog
        open={deleteImageOpen}
        onClose={() => setDeleteImageOpen(false)}
        onConfirm={async () => {
          await deleteImageMutation.mutateAsync(userId);
          setDeleteImageOpen(false);
        }}
        title="Supprimer la photo"
        description="Êtes-vous sûr de vouloir supprimer la photo de profil ?"
        loading={deleteImageMutation.isPending}
      />
    </VStack>
  );
}
