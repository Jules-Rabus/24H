"use client";

import { Button, Dialog, Portal, Text } from "@chakra-ui/react";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  loading,
}: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={({ open }) => !open && onClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="md">
            <Dialog.Header>
              <Dialog.Title>{title}</Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  position="absolute"
                  top="3"
                  right="3"
                >
                  ✕
                </Button>
              </Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Body>
              <Text color="fg.muted">{description}</Text>
            </Dialog.Body>
            <Dialog.Footer gap="3">
              <Button variant="outline" onClick={onClose} disabled={loading}>
                Annuler
              </Button>
              <Button colorPalette="red" onClick={onConfirm} loading={loading}>
                Supprimer
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
