/**
 * Unit tests for components/classement/generateBibQr.ts
 */
import { describe, it, expect, vi } from "vitest";

// Mock @bwip-js/browser before importing to avoid canvas dependency
vi.mock("@bwip-js/browser", () => ({
  qrcode: vi.fn(
    (
      canvas: HTMLCanvasElement,
      _opts: { bcid: string; text: string; [k: string]: unknown },
    ) => {
      // Simulate a minimal canvas side-effect
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillRect(0, 0, 10, 10);
      }
    },
  ),
}));

import { generateBibQr } from "@/components/classement/generateBibQr";

describe("generateBibQr", () => {
  it("returns a value (canvas.toDataURL result)", () => {
    // jsdom does not implement HTMLCanvasElement.toDataURL (returns null).
    // We just verify the function executes without throwing.
    expect(() => generateBibQr(42)).not.toThrow();
  });

  it("calls qrcode with the user id encoded as JSON", async () => {
    const { qrcode } = await import("@bwip-js/browser");
    const mockQrcode = vi.mocked(qrcode);
    mockQrcode.mockClear();

    generateBibQr(99);

    expect(mockQrcode).toHaveBeenCalledOnce();
    const opts = mockQrcode.mock.calls[0][1] as unknown as {
      bcid: string;
      text: string;
    };
    expect(opts.bcid).toBe("qrcode");
    expect(opts.text).toBe(JSON.stringify({ originId: 99 }));
  });

  it("encodes different user ids correctly", async () => {
    const { qrcode } = await import("@bwip-js/browser");
    const mockQrcode = vi.mocked(qrcode);
    mockQrcode.mockClear();

    generateBibQr(1);
    const opts = mockQrcode.mock.calls[0][1] as unknown as { text: string };
    expect(opts.text).toBe(JSON.stringify({ originId: 1 }));
  });
});
