"use client";

import { useState } from "react";
import {
  Button,
  Dialog,
  Field,
  Input,
  Progress,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useForm } from "@tanstack/react-form";
import { useCreateRunMutation } from "@/state/admin/runs/mutations";

export function BatchRunGenerator({ onClose }: { onClose: () => void }) {
  const createMutation = useCreateRunMutation();
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  const form = useForm({
    defaultValues: { firstHour: "", lastHour: "" },
    onSubmit: async ({ value }) => {
      const start = new Date(value.firstHour);
      const end = new Date(value.lastHour);
      const runs: { startDate: string; endDate: string }[] = [];
      const cursor = new Date(start);
      while (cursor < end) {
        const runStart = new Date(cursor);
        cursor.setHours(cursor.getHours() + 1);
        runs.push({
          startDate: runStart.toISOString(),
          endDate: new Date(cursor).toISOString(),
        });
      }
      setProgress({ current: 0, total: runs.length });
      for (let i = 0; i < runs.length; i++) {
        await createMutation.mutateAsync(runs[i]);
        setProgress({ current: i + 1, total: runs.length });
      }
      onClose();
    },
  });

  const [previewCount, setPreviewCount] = useState(0);
  const updatePreview = () => {
    const fh = form.getFieldValue("firstHour");
    const lh = form.getFieldValue("lastHour");
    if (fh && lh) {
      setPreviewCount(
        Math.max(
          0,
          Math.ceil(
            (new Date(lh).getTime() - new Date(fh).getTime()) / 3_600_000,
          ),
        ),
      );
    } else {
      setPreviewCount(0);
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
          <form.Field
            name="firstHour"
            validators={{
              onChange: ({ value }) =>
                value ? undefined : "Heure de départ requise",
            }}
          >
            {(field) => (
              <Field.Root required invalid={!!field.state.meta.errors.length}>
                <Field.Label>Première heure</Field.Label>
                <Input
                  type="datetime-local"
                  value={field.state.value}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                    setTimeout(updatePreview, 0);
                  }}
                  onBlur={field.handleBlur}
                />
                <Field.ErrorText>{field.state.meta.errors[0]}</Field.ErrorText>
              </Field.Root>
            )}
          </form.Field>
          <form.Field
            name="lastHour"
            validators={{
              onChange: ({ value }) => {
                if (!value) return "Heure de fin requise";
                const start = form.getFieldValue("firstHour");
                if (start && new Date(value) <= new Date(start)) {
                  return "Doit être après la première heure";
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <Field.Root required invalid={!!field.state.meta.errors.length}>
                <Field.Label>Dernière heure</Field.Label>
                <Input
                  type="datetime-local"
                  value={field.state.value}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                    setTimeout(updatePreview, 0);
                  }}
                  onBlur={field.handleBlur}
                />
                <Field.ErrorText>{field.state.meta.errors[0]}</Field.ErrorText>
              </Field.Root>
            )}
          </form.Field>

          {previewCount > 0 && (
            <Text fontSize="sm" color="fg.muted">
              Cela créera <strong>{previewCount}</strong> run
              {previewCount > 1 ? "s" : ""} (1 par heure)
            </Text>
          )}

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
                {progress.current} / {progress.total} runs créés
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
          disabled={!!progress}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          colorPalette="primary"
          loading={!!progress}
          disabled={previewCount === 0}
        >
          Générer {previewCount} run{previewCount > 1 ? "s" : ""}
        </Button>
      </Dialog.Footer>
    </form>
  );
}
