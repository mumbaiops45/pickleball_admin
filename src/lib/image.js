"use client";



export const MAX_ENCODED_BYTES = 70_000;

const EDGES = [512, 384, 288, 200];
const QUALITIES = [0.82, 0.7, 0.6, 0.45];

export const ACCEPT = "image/png,image/jpeg,image/webp,image/svg+xml";

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
    source.close?.();
  }
}
