"use client";

import { useEffect, useRef } from "react";
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

export default function QrCodeDisplay({
  userId,
  open,
  onOpenChange,
}: QrCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (open && canvasRef.current) {
      qrcode(canvasRef.current, {
        bcid: "qrcode",
        text: JSON.stringify({ originId: userId }),
        scale: 8,
      });
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
        <LuQrCode /> QR Code
      </Button>

      <Dialog.Root open={open} onOpenChange={({ open: o }) => onOpenChange(o)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="sm">
              <Dialog.Header>
                <Dialog.Title>QR Code — Dossard #{userId}</Dialog.Title>
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
                <VStack gap="4" align="center" py="4">
                  <Box
                    bg="white"
                    p="4"
                    rounded="xl"
                    shadow="sm"
                    borderWidth="1px"
                    borderColor="gray.200"
                  >
                    <canvas ref={canvasRef} />
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
