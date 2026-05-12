/**
 * Browser-side HEIC/HEIF → JPEG conversion using heic2any.
 *
 * HEIC is the default capture format on iPhone (and an option on Samsung S25+
 * Pixel), but it's *not* rendered natively by Chrome / Brave / Firefox / Edge
 * (only Safari and Samsung Internet support it). To keep uploaded photos
 * viewable everywhere, we convert them client-side before posting to the API.
 *
 * heic2any is loaded lazily so the bundle stays small for users who never
 * pick a HEIC file (>99% of uploads on Android/Windows).
 */

const HEIC_MIME_TYPES = new Set(["image/heic", "image/heif"]);
const HEIC_EXTENSIONS = /\.(heic|heif)$/i;

/** True if the file looks like a HEIC/HEIF (by MIME or extension). */
export function isHeic(file: File): boolean {
  if (HEIC_MIME_TYPES.has(file.type.toLowerCase())) return true;
  return HEIC_EXTENSIONS.test(file.name);
}

/**
 * Convert a HEIC/HEIF file to JPEG. Returns the original File if it's already
 * a non-HEIC format. Throws if conversion fails (caller decides whether to
 * still upload the original HEIC).
 */
export async function heicToJpeg(file: File, quality = 0.85): Promise<File> {
  if (!isHeic(file)) return file;

  // Lazy import — keeps the WASM bundle out of the initial chunk.
  const { default: heic2any } = await import("heic2any");

  const converted = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality,
  });

  // heic2any returns Blob | Blob[] when the HEIF contains multiple frames.
  const blob = Array.isArray(converted) ? converted[0] : converted;
  const newName = file.name.replace(HEIC_EXTENSIONS, ".jpg");

  return new File([blob], newName, {
    type: "image/jpeg",
    lastModified: file.lastModified,
  });
}
