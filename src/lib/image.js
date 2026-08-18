"use client";

/**
 * Turning a picked file into something `category.image` can hold.
 *
 * The API stores images as a String and has no upload route (API-REVIEW.md
 * §5), so a file selected from disk has to travel as a `data:` URI inside the
 * JSON body. That puts a hard ceiling on it: `express.json()` defaults to a
 * 100kb limit, and the backend does not raise it — a larger body comes back as
 * a 413 before any controller runs. So the file is not merely converted, it is
 * downscaled and re-encoded until the encoded string fits a budget below that.
 *
 * The knobs are tried worst-case-last: full size at good quality first, then
 * progressively smaller and rougher. The first result under budget wins, so a
 * small clean logo keeps its detail and only a large photo gets punished.
 */

/** Leaves ~30kb of the 100kb body for name, description and JSON overhead. */
export const MAX_ENCODED_BYTES = 70_000;

const EDGES = [512, 384, 288, 200];
const QUALITIES = [0.82, 0.7, 0.6, 0.45];

export const ACCEPT = "image/png,image/jpeg,image/webp,image/svg+xml";

/** Guards the decode step; the budget below is what actually matters. */
const MAX_INPUT_BYTES = 12 * 1024 * 1024;

export class ImageError extends Error {
  constructor(message) {
    super(message);
    this.name = "ImageError";
  }
}

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** A data URI's cost on the wire is the string itself, not the decoded image. */
export const encodedSize = (dataUrl) =>
  typeof dataUrl === "string" ? dataUrl.length : 0;

export const isDataUrl = (value) =>
  typeof value === "string" && value.startsWith("data:");

const readAsDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () =>
      reject(new ImageError("That file could not be read."));
    reader.readAsDataURL(blob);
  });

/**
 * `createImageBitmap` decodes off the main thread and is what every target
 * browser uses; the `<img>` path is there for Safari versions that reject a
 * Blob argument.
 */
async function decode(file) {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      // fall through to the <img> decode
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    return image;
  } catch {
    throw new ImageError("That file is not an image the browser can read.");
  } finally {
    URL.revokeObjectURL(url);
  }
}

const toBlob = (canvas, type, quality) =>
  new Promise((resolve) => canvas.toBlob(resolve, type, quality));

/**
 * WebP is ~30% smaller than JPEG at the same quality and, unlike JPEG, keeps
 * the alpha channel a cut-out product shot needs. A browser that cannot encode
 * it returns a PNG from `toBlob` regardless of the type asked for, which is
 * why the result's own `type` is trusted over the requested one.
 */
async function encode(source, edge, quality) {
  const width = source.width;
  const height = source.height;
  const scale = Math.min(1, edge / Math.max(width, height));

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));

  const context = canvas.getContext("2d");
  context.imageSmoothingQuality = "high";
  context.drawImage(source, 0, 0, canvas.width, canvas.height);

  const blob = await toBlob(canvas, "image/webp", quality);
  if (!blob) throw new ImageError("The image could not be re-encoded.");

  return {
    dataUrl: await readAsDataUrl(blob),
    width: canvas.width,
    height: canvas.height,
    type: blob.type,
  };
}

/**
 * SVG is already small and rasterising it would throw away the only reason to
 * use it, so it skips the canvas entirely and is size-checked as-is.
 */
async function passThroughSvg(file, budget) {
  const dataUrl = await readAsDataUrl(file);

  if (encodedSize(dataUrl) > budget) {
    throw new ImageError(
      `That SVG encodes to ${formatBytes(
        encodedSize(dataUrl),
      )}, over the ${formatBytes(budget)} left in the API body limit.`,
    );
  }

  return {
    dataUrl,
    width: null,
    height: null,
    type: file.type,
    bytes: encodedSize(dataUrl),
  };
}

/**
 * Reads a picked file and returns a `data:` URI small enough to store.
 *
 * Resolves to `{ dataUrl, width, height, type, bytes }`. Rejects with an
 * `ImageError` whose message is safe to show in the form.
 *
 * `budget` is the encoded size this one image may occupy. A product gallery
 * puts several images in a single body, so it passes what is left rather than
 * letting each image spend the whole allowance.
 */
export async function fileToStorableDataUrl(
  file,
  { budget = MAX_ENCODED_BYTES } = {},
) {
  if (!file) throw new ImageError("No file was selected.");

  if (budget < 4_000) {
    throw new ImageError(
      "There is no room left in the request for another image. Remove one, or link to it by URL instead.",
    );
  }

  if (!file.type.startsWith("image/")) {
    throw new ImageError(`${file.name} is not an image.`);
  }

  if (file.size > MAX_INPUT_BYTES) {
    throw new ImageError(
      `${formatBytes(file.size)} is too large to process. Pick something under ${formatBytes(
        MAX_INPUT_BYTES,
      )}.`,
    );
  }

  if (file.type === "image/svg+xml") return passThroughSvg(file, budget);

  const source = await decode(file);

  try {
    let smallest = null;

    for (const edge of EDGES) {
      for (const quality of QUALITIES) {
        const result = await encode(source, edge, quality);
        const bytes = encodedSize(result.dataUrl);

        if (bytes <= budget) return { ...result, bytes };
        if (!smallest || bytes < smallest.bytes) smallest = { ...result, bytes };
      }
    }

    throw new ImageError(
      `This image will not compress below ${formatBytes(
        budget,
      )} (best was ${formatBytes(
        smallest.bytes,
      )}). Crop it first, or host it somewhere and paste the URL instead.`,
    );
  } finally {
    // Frees the decoded pixels immediately rather than at the next GC.
    source.close?.();
  }
}
