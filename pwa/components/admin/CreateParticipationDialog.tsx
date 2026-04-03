"use client";

import { Button, Dialog, Field, Input, VStack } from "@chakra-ui/react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { useCreateParticipationMutation } from "@/state/admin/participations/mutations";

export function CreateParticipationDialog({
  onClose,
}: {
  onClose: () => void;
}) {
  const createMutation = useCreateParticipationMutation();

  const form = useForm({
    defaultValues: {
      userId: "",
      runId: "",
    },
    onSubmit: async ({ value }) => {
      await createMutation.mutateAsync({
        user: `/users/${value.userId}`,
        run: `/runs/${value.runId}`,
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
            name="userId"
            validators={{
              onChange: z
                .string()
                .min(1, "ID du coureur requis")
                .regex(/^\d+$/, "Doit être un nombre"),
            }}
          >
            {(field) => (
              <Field.Root required invalid={!!field.state.meta.errors.length}>
                <Field.Label>ID du coureur</Field.Label>
                <Input
                  type="number"
                  placeholder="Ex : 12"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                <Field.ErrorText>
                  {field.state.meta.errors[0]?.message}
                </Field.ErrorText>
              </Field.Root>
            )}
          </form.Field>
          <form.Field
            name="runId"
            validators={{
              onChange: z
                .string()
                .min(1, "ID du run requis")
                .regex(/^\d+$/, "Doit être un nombre"),
            }}
          >
            {(field) => (
              <Field.Root required invalid={!!field.state.meta.errors.length}>
                <Field.Label>ID du run</Field.Label>
                <Input
                  type="number"
                  placeholder="Ex : 3"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                <Field.ErrorText>
                  {field.state.meta.errors[0]?.message}
                </Field.ErrorText>
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
          disabled={createMutation.isPending}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          colorPalette="primary"
          loading={createMutation.isPending}
        >
          Créer
        </Button>
      </Dialog.Footer>
    </form>
  );
}
