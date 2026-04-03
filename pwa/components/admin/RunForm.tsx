"use client";

import { Button, Dialog, Field, Input, VStack } from "@chakra-ui/react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import type { AdminRun } from "@/state/admin/runs/queries";
import {
  useCreateRunMutation,
  useUpdateRunMutation,
} from "@/state/admin/runs/mutations";

export function RunForm({
  run,
  onClose,
}: {
  run?: AdminRun;
  onClose: () => void;
}) {
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
