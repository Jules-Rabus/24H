"use client";

import { Button, Dialog, Field, Input } from "@chakra-ui/react";
import { useForm } from "@tanstack/react-form";
import type { AdminParticipation } from "@/state/admin/participations/queries";
import { editParticipationSchema } from "@/state/admin/participations/schemas";
import { useUpdateParticipationMutation } from "@/state/admin/participations/mutations";

export function EditParticipationDialog({
  participation,
  onClose,
}: {
  participation: AdminParticipation;
  onClose: () => void;
}) {
  const updateMutation = useUpdateParticipationMutation();

  const form = useForm({
    defaultValues: {
      arrivalTime: participation.arrivalTime
        ? new Date(participation.arrivalTime).toISOString().slice(0, 16)
        : "",
    },
    validators: {
      onChange: editParticipationSchema,
    },
    onSubmit: async ({ value }) => {
      if (!participation.id) return;
      await updateMutation.mutateAsync({
        id: participation.id,
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
        <form.Field name="arrivalTime">
          {(field) => (
            <Field.Root>
              <Field.Label>Heure d&apos;arrivée</Field.Label>
              <Input
                type="datetime-local"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
              <Field.HelperText>
                Laisser vide pour remettre en IN_PROGRESS
              </Field.HelperText>
            </Field.Root>
          )}
        </form.Field>
      </Dialog.Body>
      <Dialog.Footer gap="3">
        <Button variant="outline" onClick={onClose} type="button">
          Annuler
        </Button>
        <form.Subscribe selector={(s) => s.canSubmit}>
          {(canSubmit) => (
            <Button
              type="submit"
              colorPalette="primary"
              loading={updateMutation.isPending}
              disabled={!canSubmit}
            >
              Enregistrer
            </Button>
          )}
        </form.Subscribe>
      </Dialog.Footer>
    </form>
  );
}
