// ═══════════════════════════════════════════════════════════════
// SITA OS — Client-Side Portrait Crop & Resize
// Center-crops to square and resizes to target dimensions before
// upload so portraits fit the expected square guidelines.
// ═══════════════════════════════════════════════════════════════

const TARGET_SIZE = 512; // px — output square dimension
const OUTPUT_TYPE = "image/png";
const OUTPUT_QUALITY = 0.92;

/**
 * Takes an image File, center-crops it to a square, resizes to
 * TARGET_SIZE×TARGET_SIZE, and returns a new File ready for upload.
 */
export async function cropAndResizePortrait(
  file: File,
  targetSize: number = TARGET_SIZE,
): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;

  // Determine square crop (center)
  const side = Math.min(width, height);
  const sx = Math.round((width - side) / 2);
  const sy = Math.round((height - side) / 2);

  const canvas = new OffscreenCanvas(targetSize, targetSize);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");

  ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, targetSize, targetSize);
  bitmap.close();

  const blob = await canvas.convertToBlob({ type: OUTPUT_TYPE, quality: OUTPUT_QUALITY });
  return new File([blob], file.name.replace(/\.\w+$/, ".png"), { type: OUTPUT_TYPE });
}