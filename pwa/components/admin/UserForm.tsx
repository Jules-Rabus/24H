"use client";

import {
  Button,
  Checkbox,
  Dialog,
  Field,
  HStack,
  Input,
  VStack,
} from "@chakra-ui/react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import type { AdminUser } from "@/state/admin/users/queries";
import {
  useCreateUserMutation,
  useUpdateUserMutation,
} from "@/state/admin/users/mutations";

export function UserForm({
  user,
  onClose,
}: {
  user?: AdminUser;
  onClose: () => void;
}) {
  const createMutation = useCreateUserMutation();
  const updateMutation = useUpdateUserMutation();

  const isLoading = createMutation.isPending || updateMutation.isPending;

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

      if (user?.id) {
        await updateMutation.mutateAsync({ id: user.id, body });
      } else {
        await createMutation.mutateAsync({
          ...body,
          plainPassword: value.plainPassword || null,
        });
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
            name="firstName"
            validators={{
              onChange: ({ value }) => {
                const r = z.string().min(1, "Prénom requis").safeParse(value);
                return r.success ? undefined : r.error.issues[0].message;
              },
            }}
          >
            {(field) => (
              <Field.Root required invalid={!!field.state.meta.errors.length}>
                <Field.Label>Prénom</Field.Label>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Prénom"
                />
                <Field.ErrorText>{field.state.meta.errors[0]}</Field.ErrorText>
              </Field.Root>
            )}
          </form.Field>

          <form.Field
            name="lastName"
            validators={{
              onChange: ({ value }) => {
                const r = z.string().min(1, "Nom requis").safeParse(value);
                return r.success ? undefined : r.error.issues[0].message;
              },
            }}
          >
            {(field) => (
              <Field.Root required invalid={!!field.state.meta.errors.length}>
                <Field.Label>Nom</Field.Label>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Nom"
                />
                <Field.ErrorText>{field.state.meta.errors[0]}</Field.ErrorText>
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

          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) => {
                if (!value) return undefined;
                const r = z.string().email("Email invalide").safeParse(value);
                return r.success ? undefined : r.error.issues[0].message;
              },
            }}
          >
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
                <Field.ErrorText>{field.state.meta.errors[0]}</Field.ErrorText>
              </Field.Root>
            )}
          </form.Field>

          <form.Field name="plainPassword">
            {(field) => (
              <Field.Root>
                <Field.Label>
                  {user ? "Nouveau mot de passe" : "Mot de passe"}
                </Field.Label>
                <Input
                  type="password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={
                    user ? "Laisser vide pour ne pas changer" : "Mot de passe"
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
          {user ? "Modifier" : "Créer"}
        </Button>
      </Dialog.Footer>
    </form>
  );
}
