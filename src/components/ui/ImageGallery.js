"use client";

import { useRef, useState } from "react";
import Button from "@/components/ui/Button";
import {
  CloseIcon,
  ImageIcon,
  LinkIcon,
  SpinnerIcon,
  UploadIcon,
} from "@/components/ui/Icons";
import {
  ACCEPT,
  ImageError,
  MAX_ENCODED_BYTES,
  encodedSize,
  fileToStorableDataUrl,
  formatBytes,
  isDataUrl,
} from "@/lib/image";

/**
 * The `images: [String]` array on a product.
 *
 * Where <ImagePicker> handles one image with the whole size allowance, a
 * gallery has to divide it: every image goes into the same request body, and
 * the API's 100kb limit applies to the body, not to each field. So the budget
 * passed to the encoder is what the *already chosen* inline images have left
 * over, and the meter below the grid shows it being spent. URLs cost only
 * their own length, which is why they stay usable once uploads are full.
 *
 * The first image is the cover — that is a storefront convention, not
 * something the schema states — so reordering is offered as "Make cover"
 * rather than drag handles, which is the only reorder anyone actually needs.
 */
export default function ImageGallery({
  label = "Images",
  value = [],
  onChange,
  disabled = false,
  hint,
}) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [url, setUrl] = useState("");
  const [adding, setAdding] = useState(false);

  const spent = value.reduce(
    (total, image) => total + (isDataUrl(image) ? encodedSize(image) : 0),
    0,
  );
  const remaining = Math.max(0, MAX_ENCODED_BYTES - spent);
  const used = Math.min(100, Math.round((spent / MAX_ENCODED_BYTES) * 100));

  const addFiles = async (files) => {
    const list = Array.from(files ?? []);
    if (!list.length) return;

    setBusy(true);
    setError(null);

    // Sequential, not Promise.all: each image's budget depends on what the
    // previous one actually consumed.
    const added = [];
    let left = remaining;

    try {
      for (const file of list) {
        const result = await fileToStorableDataUrl(file, { budget: left });
        added.push(result.dataUrl);
        left -= result.bytes;
      }
    } catch (cause) {
      setError(
        cause instanceof ImageError
          ? cause.message
          : "That image could not be processed.",
      );
    } finally {
      if (added.length) onChange([...value, ...added]);
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const addUrl = () => {
    const trimmed = url.trim();
    if (!trimmed) return;

    setError(null);
    onChange([...value, trimmed]);
    setUrl("");
    setAdding(false);
  };

  const removeAt = (index) =>
    onChange(value.filter((_, position) => position !== index));

  const makeCover = (index) =>
    onChange([value[index], ...value.filter((_, p) => p !== index)]);

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[13px] font-medium text-ink">
          {label}
          {value.length ? (
            <span className="ml-1.5 font-normal text-mist">
              {value.length}
            </span>
          ) : null}
        </span>

        <div className="flex gap-1.5">
          <Button
            tone="outline"
            size="sm"
            icon={UploadIcon}
            disabled={disabled || busy}
            onClick={() => inputRef.current?.click()}
          >
            Upload
          </Button>
          <Button
            tone="ghost"
            size="sm"
            icon={LinkIcon}
            disabled={disabled || busy}
            onClick={() => setAdding((open) => !open)}
          >
            URL
          </Button>
        </div>
      </div>

      {adding ? (
        <div className="flex gap-2">
          <input
            type="url"
            autoFocus
            aria-label="Image URL"
            value={url}
            disabled={disabled}
            onChange={(event) => setUrl(event.target.value)}
            onKeyDown={(event) => {
              // Enter inside a form would submit the product instead.
              if (event.key !== "Enter") return;
              event.preventDefault();
              addUrl();
            }}
            placeholder="https://…/paddle-front.jpg"
            className="h-10 w-full rounded-lg border border-line-strong bg-paper px-3 text-sm text-ink placeholder:text-faint focus:border-volt-deep focus:outline-none focus:ring-2 focus:ring-volt-deep/25"
          />
          <Button tone="outline" size="sm" onClick={addUrl} disabled={!url.trim()}>
            Add
          </Button>
        </div>
      ) : null}

      {value.length ? (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {value.map((image, index) => (
            <li
              key={`${index}-${image.slice(0, 40)}`}
              className="group relative aspect-square overflow-hidden rounded-lg border border-line bg-surface"
            >
              <Thumb src={image} />

              <button
                type="button"
                onClick={() => removeAt(index)}
                disabled={disabled}
                aria-label={`Remove image ${index + 1}`}
                className="absolute right-1 top-1 grid size-6 place-items-center rounded-md bg-ink/70 text-paper opacity-0 transition-opacity hover:bg-ink focus:opacity-100 group-hover:opacity-100"
              >
                <CloseIcon className="size-3.5" />
              </button>

              {index === 0 ? (
                <span className="absolute bottom-1 left-1 rounded bg-ink/75 px-1.5 py-0.5 text-[10.5px] font-medium text-paper">
                  Cover
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => makeCover(index)}
                  disabled={disabled}
                  className="absolute bottom-1 left-1 rounded bg-ink/70 px-1.5 py-0.5 text-[10.5px] font-medium text-paper opacity-0 transition-opacity hover:bg-ink focus:opacity-100 group-hover:opacity-100"
                >
                  Make cover
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || busy}
          className="flex flex-col items-center gap-1.5 rounded-xl border border-dashed border-line-strong bg-surface px-4 py-7 text-center hover:bg-surface-2 disabled:cursor-not-allowed"
        >
          {busy ? (
            <SpinnerIcon className="size-5 animate-spin text-mist" aria-hidden="true" />
          ) : (
            <ImageIcon className="size-5 text-faint" aria-hidden="true" />
          )}
          <span className="text-[13px] font-medium text-ink">
            {busy ? "Resizing…" : "Choose files, or add a URL"}
          </span>
          <span className="text-[12px] text-mist">
            The first image is the storefront cover
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="sr-only"
        tabIndex={-1}
        disabled={disabled}
        onChange={(event) => addFiles(event.target.files)}
      />

      {spent > 0 ? (
        <div className="flex items-center gap-2.5">
          <span
            className="h-1 flex-1 overflow-hidden rounded-full bg-surface-2"
            role="progressbar"
            aria-valuenow={used}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Request size used by inline images"
          >
            <span
              className={`block h-full transition-all ${
                used > 85 ? "bg-bad" : "bg-volt-deep"
              }`}
              style={{ width: `${used}%` }}
            />
          </span>
          <span className="shrink-0 text-[11.5px] text-mist tnum">
            {formatBytes(spent)} of {formatBytes(MAX_ENCODED_BYTES)} inline
          </span>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="text-[12.5px] text-bad">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[12.5px] text-mist">{hint}</p>
      ) : null}
    </div>
  );
}

function Thumb({ src }) {
  const [broken, setBroken] = useState(false);

  if (broken) {
    return (
      <span className="grid size-full place-items-center" aria-hidden="true">
        <ImageIcon className="size-5 text-faint" />
      </span>
    );
  }

  return (
    // Arbitrary remote hosts and data URIs both sit outside next/image.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      onError={() => setBroken(true)}
      className="size-full object-cover"
    />
  );
}
