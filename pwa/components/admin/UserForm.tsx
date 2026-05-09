"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  Field,
  HStack,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { LuCamera, LuTrash2 } from "react-icons/lu";
import { useForm } from "@tanstack/react-form";
import {
  useAdminUsersQuery,
  type AdminUser,
} from "@/state/admin/users/queries";
import { createUserSchema } from "@/state/admin/users/schemas";
import {
  useAddUserToCurrentRunMutation,
  useCreateUserMutation,
  useDeleteUserImageMutation,
  useUpdateUserMutation,
  useUploadUserImageMutation,
} from "@/state/admin/users/mutations";
import { useDebounce } from "@/hooks/useDebounce";
import { toaster } from "@/components/ui/toaster";

const norm = (s: string) => s.trim().toLowerCase();

export function UserForm({
  user,
  onClose,
}: {
  user?: AdminUser;
  onClose: () => void;
}) {
  const isEdit = !!user?.id;
  const createMutation = useCreateUserMutation();
  const updateMutation = useUpdateUserMutation();
  const uploadImageMutation = useUploadUserImageMutation();
  const deleteImageMutation = useDeleteUserImageMutation();
  const linkToRunMutation = useAddUserToCurrentRunMutation();

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoRemoved, setPhotoRemoved] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const photoPreview = useMemo(
    () => (photoFile ? URL.createObjectURL(photoFile) : null),
    [photoFile],
  );
  useEffect(() => {
    if (!photoPreview) return;
    return () => URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

  const isLoading =
    createMutation.isPending ||
    updateMutation.isPending ||
    uploadImageMutation.isPending ||
    deleteImageMutation.isPending ||
    linkToRunMutation.isPending;

  const existingImageUrl =
    user?.image && !photoRemoved
      ? `${process.env.NEXT_PUBLIC_ENTRYPOINT ?? ""}${user.image}`
      : null;

  const form = useForm({
    defaultValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      surname: user?.surname ?? "",
      email: user?.email ?? "",
      plainPassword: "",
      organization: user?.organization ?? "",
      isAdmin: user?.roles?.includes("ROLE_ADMIN") ?? false,
    },
    validators: {
      onChange: createUserSchema,
    },
    onSubmit: async ({ value }) => {
      const roles: string[] = value.isAdmin
        ? ["ROLE_USER", "ROLE_ADMIN"]
        : ["ROLE_USER"];

      const body = {
        firstName: value.firstName,
        lastName: value.lastName,
        surname: value.surname || null,
        email: value.email || null,
        organization: value.organization || null,
        roles,
        ...(value.plainPassword ? { plainPassword: value.plainPassword } : {}),
      };

      let createdId: number | null = null;
      if (isEdit) {
        await updateMutation.mutateAsync({ id: user!.id!, body });
        createdId = user!.id!;
      } else {
        const created = await createMutation.mutateAsync({
          ...body,
          plainPassword: value.plainPassword || null,
        });
        createdId = (created as { id?: number })?.id ?? null;
      }

      if (createdId && isEdit && photoRemoved && user?.image && !photoFile) {
        try {
          await deleteImageMutation.mutateAsync(createdId);
        } catch {
          toaster.create({
            type: "error",
            title: "Photo non supprimée",
            description:
              "Le coureur a été enregistré, mais la photo n'a pas pu être supprimée. Réessayez depuis la fiche.",
          });
        }
      }

      if (createdId && photoFile) {
        try {
          await uploadImageMutation.mutateAsync({
            userId: createdId,
            file: photoFile,
          });
        } catch {
          toaster.create({
            type: "error",
            title: "Photo non uploadée",
            description:
              "Le coureur a été enregistré, mais la photo n'a pas pu être envoyée. Vous pouvez réessayer depuis la fiche du coureur.",
          });
        }
      }

      onClose();
    },
  });

  const debouncedFirstName = useDebounce(firstName, 300);
  const debouncedLastName = useDebounce(lastName, 300);

  const duplicateQueryEnabled =
    !isEdit &&
    debouncedFirstName.trim().length >= 2 &&
    debouncedLastName.trim().length >= 2;

  const { data: duplicateData } = useAdminUsersQuery(
    duplicateQueryEnabled
      ? {
          firstName: debouncedFirstName.trim(),
          lastName: debouncedLastName.trim(),
          itemsPerPage: 5,
        }
      : {},
  );

  const exactMatches = useMemo(() => {
    if (!duplicateQueryEnabled || !duplicateData?.member) return [];
    const fn = norm(debouncedFirstName);
    const ln = norm(debouncedLastName);
    return duplicateData.member.filter(
      (u) => norm(u.firstName) === fn && norm(u.lastName) === ln,
    );
  }, [
    duplicateQueryEnabled,
    duplicateData,
    debouncedFirstName,
    debouncedLastName,
  ]);

  const handleLink = async (existingUserId: number) => {
    try {
      await linkToRunMutation.mutateAsync(existingUserId);
      if (photoFile) {
        try {
          await uploadImageMutation.mutateAsync({
            userId: existingUserId,
            file: photoFile,
          });
        } catch {
          toaster.create({
            type: "error",
            title: "Photo non uploadée",
            description:
              "Le coureur a été inscrit à l'édition courante, mais la photo n'a pas pu être envoyée.",
          });
        }
      }
      toaster.create({
        type: "success",
        title: "Coureur inscrit à l'édition courante",
      });
      onClose();
    } catch (e) {
      toaster.create({
        type: "error",
        title: "Inscription impossible",
        description: e instanceof Error ? e.message : undefined,
      });
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
          {!isEdit && exactMatches.length > 0 && (
            <Alert.Root status="warning">
              <Alert.Indicator />
              <Box flex="1">
                <Alert.Title>Coureur déjà existant</Alert.Title>
                <Alert.Description>
                  <VStack align="stretch" gap="2" mt="1">
                    {exactMatches.map((m) => (
                      <HStack key={m.id} justify="space-between" gap="3">
                        <Text fontSize="sm">
                          {m.firstName} {m.lastName}
                          {m.organization ? ` — ${m.organization}` : ""}
                        </Text>
                        <Button
                          size="xs"
                          variant="solid"
                          colorPalette="primary"
                          loading={linkToRunMutation.isPending}
                          onClick={() => handleLink(m.id!)}
                          type="button"
                        >
                          Inscrire à l&apos;édition courante
                        </Button>
                      </HStack>
                    ))}
                  </VStack>
                </Alert.Description>
              </Box>
            </Alert.Root>
          )}

          <form.Field name="firstName">
            {(field) => (
              <Field.Root required invalid={!!field.state.meta.errors.length}>
                <Field.Label>Prénom</Field.Label>
                <Input
                  value={field.state.value}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                    setFirstName(e.target.value);
                  }}
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
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                    setLastName(e.target.value);
                  }}
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

          <form.Field name="plainPassword">
            {(field) => (
              <Field.Root>
                <Field.Label>
                  {isEdit ? "Nouveau mot de passe" : "Mot de passe"}
                </Field.Label>
                <Input
                  type="password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={
                    isEdit ? "Laisser vide pour ne pas changer" : "Mot de passe"
                  }
                />
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

          <Field.Root>
            <Field.Label>Photo (optionnel)</Field.Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setPhotoFile(file);
                if (file) setPhotoRemoved(false);
              }}
            />
            <HStack gap="3" align="center">
              {photoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoPreview}
                  alt="Aperçu"
                  style={{
                    width: "64px",
                    height: "64px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "1px solid var(--chakra-colors-border-subtle)",
                  }}
                />
              ) : existingImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={existingImageUrl}
                  alt="Photo actuelle"
                  style={{
                    width: "64px",
                    height: "64px",
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
                  boxSize="64px"
                  rounded="md"
                  bg="bg.subtle"
                  borderWidth="1px"
                  borderColor="border.subtle"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <LuCamera size={20} />
                </Box>
              )}
              <HStack gap="2">
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {photoFile || existingImageUrl
                    ? "Changer"
                    : "Choisir une photo"}
                </Button>
                {(photoFile || existingImageUrl) && (
                  <Button
                    size="sm"
                    variant="outline"
                    colorPalette="red"
                    type="button"
                    onClick={() => {
                      if (photoFile) {
                        setPhotoFile(null);
                        if (fileInputRef.current)
                          fileInputRef.current.value = "";
                      } else {
                        setPhotoRemoved(true);
                      }
                    }}
                  >
                    <LuTrash2 />
                  </Button>
                )}
              </HStack>
            </HStack>
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
        <form.Subscribe selector={(s) => s.canSubmit}>
          {(canSubmit) => (
            <Button
              type="submit"
              colorPalette="primary"
              loading={isLoading}
              disabled={!canSubmit || (!isEdit && exactMatches.length > 0)}
            >
              {isEdit ? "Modifier" : "Créer"}
            </Button>
          )}
        </form.Subscribe>
      </Dialog.Footer>
    </form>
  );
}
