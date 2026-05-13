/**
 * Unit tests for src/utils/heicToJpeg.ts
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock heic2any at module level — vi.mock is hoisted
const mockHeic2any = vi.fn();
vi.mock("heic2any", () => ({ default: mockHeic2any }));

import { isHeic, heicToJpeg } from "@/utils/heicToJpeg";

describe("isHeic", () => {
  it("returns true for image/heic MIME type", () => {
    const file = new File([""], "photo.heic", { type: "image/heic" });
    expect(isHeic(file)).toBe(true);
  });

  it("returns true for image/heif MIME type", () => {
    const file = new File([""], "photo.heif", { type: "image/heif" });
    expect(isHeic(file)).toBe(true);
  });

  it("returns true for .heic extension regardless of MIME", () => {
    const file = new File([""], "photo.heic", { type: "" });
    expect(isHeic(file)).toBe(true);
  });

  it("returns true for .heif extension regardless of MIME (uppercase)", () => {
    const file = new File([""], "photo.HEIF", { type: "" });
    expect(isHeic(file)).toBe(true);
  });

  it("returns false for image/jpeg", () => {
    const file = new File([""], "photo.jpg", { type: "image/jpeg" });
    expect(isHeic(file)).toBe(false);
  });

  it("returns false for image/png", () => {
    const file = new File([""], "photo.png", { type: "image/png" });
    expect(isHeic(file)).toBe(false);
  });

  it("returns false for video/mp4", () => {
    const file = new File([""], "video.mp4", { type: "video/mp4" });
    expect(isHeic(file)).toBe(false);
  });

  it("is case-insensitive for MIME types", () => {
    const file = new File([""], "photo.jpg", { type: "IMAGE/HEIC" });
    expect(isHeic(file)).toBe(true);
  });
});

describe("heicToJpeg", () => {
  beforeEach(() => {
    mockHeic2any.mockReset();
  });

  it("returns the original file unchanged when not HEIC", async () => {
    const file = new File(["test-data"], "photo.jpg", { type: "image/jpeg" });
    const result = await heicToJpeg(file);
    expect(result).toBe(file); // same reference
    expect(mockHeic2any).not.toHaveBeenCalled();
  });

  it("returns the original file unchanged for video/mp4", async () => {
    const file = new File(["test-data"], "video.mp4", { type: "video/mp4" });
    const result = await heicToJpeg(file);
    expect(result).toBe(file);
    expect(mockHeic2any).not.toHaveBeenCalled();
  });

  it("converts HEIC to JPEG by calling heic2any", async () => {
    const mockBlob = new Blob(["converted"], { type: "image/jpeg" });
    mockHeic2any.mockResolvedValue(mockBlob);

    const file = new File(["heic-data"], "photo.heic", { type: "image/heic" });
    const result = await heicToJpeg(file);

    expect(mockHeic2any).toHaveBeenCalledOnce();
    expect(result.name).toBe("photo.jpg");
    expect(result.type).toBe("image/jpeg");
  });

  it("handles heic2any returning an array (multi-frame HEIF)", async () => {
    const frame1 = new Blob(["frame1"], { type: "image/jpeg" });
    const frame2 = new Blob(["frame2"], { type: "image/jpeg" });
    mockHeic2any.mockResolvedValue([frame1, frame2]);

    const file = new File(["heif-data"], "photo.heif", { type: "image/heif" });
    const result = await heicToJpeg(file);

    expect(result.name).toBe("photo.jpg");
    expect(result.type).toBe("image/jpeg");
  });

  it("calls heic2any with correct options", async () => {
    const mockBlob = new Blob([""], { type: "image/jpeg" });
    mockHeic2any.mockResolvedValue(mockBlob);

    const file = new File([""], "shot.heic", { type: "image/heic" });
    await heicToJpeg(file, 0.9);

    expect(mockHeic2any).toHaveBeenCalledWith({
      blob: file,
      toType: "image/jpeg",
      quality: 0.9,
    });
  });

  it("preserves lastModified from the original file", async () => {
    const mockBlob = new Blob([""], { type: "image/jpeg" });
    mockHeic2any.mockResolvedValue(mockBlob);

    const lastModified = Date.now() - 5000;
    const file = new File([""], "shot.heic", {
      type: "image/heic",
      lastModified,
    });
    const result = await heicToJpeg(file);

    expect(result.lastModified).toBe(lastModified);
  });
});
