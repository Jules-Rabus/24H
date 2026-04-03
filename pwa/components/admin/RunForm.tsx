"use client";

import { Button, Dialog, Field, Input, VStack } from "@chakra-ui/react";
import { useForm } from "@tanstack/react-form";
import type { AdminRun } from "@/state/admin/runs/queries";
import { createRunSchema } from "@/state/admin/runs/schemas";
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
    validators: {
      onChange: createRunSchema,
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
          <form.Field name="startDate">
            {(field) => (
              <Field.Root required invalid={!!field.state.meta.errors.length}>
                <Field.Label>Date de début</Field.Label>
                <Input
                  type="datetime-local"
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
          <form.Field name="endDate">
            {(field) => (
              <Field.Root required invalid={!!field.state.meta.errors.length}>
                <Field.Label>Date de fin</Field.Label>
                <Input
                  type="datetime-local"
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
              {run ? "Modifier" : "Créer"}
            </Button>
          )}
        </form.Subscribe>
      </Dialog.Footer>
    </form>
  );
}
