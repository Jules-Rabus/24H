"use client";

import { useEffect, useState } from "react";
import { qrcode } from "@bwip-js/browser";
import {
  Box,
  Button,
  Dialog,
  IconButton,
  Portal,
  Text,
  VStack,
} from "@chakra-ui/react";
import { LuQrCode, LuX } from "react-icons/lu";

interface QrCodeDisplayProps {
  userId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function generateQrDataUrl(userId: number): string {
  const canvas = document.createElement("canvas");
  qrcode(canvas, {
    bcid: "qrcode",
    text: JSON.stringify({ originId: userId }),
    scale: 10,
  });
  return canvas.toDataURL("image/png");
}

export default function QrCodeDisplay({
  userId,
  open,
  onOpenChange,
}: QrCodeDisplayProps) {
  const [qrSrc, setQrSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    try {
      setQrSrc(generateQrDataUrl(userId));
    } catch (err) {
      console.error("QR code generation failed:", err);
    }
  }, [open, userId]);

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        colorPalette="primary"
        onClick={() => onOpenChange(true)}
      >
        <LuQrCode /> Voir mon dossard (QR Code)
      </Button>

      <Dialog.Root open={open} onOpenChange={({ open: o }) => onOpenChange(o)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="md">
              <Dialog.Header>
                <Dialog.Title>Dossard #{userId}</Dialog.Title>
                <Dialog.CloseTrigger asChild>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    position="absolute"
                    top="3"
                    right="3"
                    aria-label="Fermer"
                  >
                    <LuX />
                  </IconButton>
                </Dialog.CloseTrigger>
              </Dialog.Header>
              <Dialog.Body>
                <VStack gap="4" align="center" py="6">
                  <Box
                    bg="white"
                    p="6"
                    rounded="xl"
                    shadow="sm"
                    borderWidth="1px"
                    borderColor="gray.200"
                    display="flex"
                    justifyContent="center"
                  >
                    {qrSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={qrSrc}
                        alt={`QR Code dossard #${userId}`}
                        style={{ width: "280px", height: "280px" }}
                      />
                    ) : (
                      <Box w="280px" h="280px" />
                    )}
                  </Box>
                  <Text fontSize="sm" color="fg.muted" textAlign="center">
                    Scannez ce QR code pour identifier le coureur #{userId}
                  </Text>
                </VStack>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
}
