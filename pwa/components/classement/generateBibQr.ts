"use client";

import { qrcode } from "@bwip-js/browser";

/**
 * Generate a QR code data-URL encoding the runner's id. The barcode payload
 * is the same the scanner reads in `/scanner` (DataMatrixInput.originId).
 *
 * Must run client-side — depends on `document.createElement("canvas")`.
 */
export function generateBibQr(userId: number): string {
  const canvas = document.createElement("canvas");
  qrcode(canvas, {
    bcid: "qrcode",
    text: JSON.stringify({ originId: userId }),
    scale: 8,
  });
  return canvas.toDataURL("image/png");
}
