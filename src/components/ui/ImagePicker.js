"use client";

import { useRef, useState } from "react";
import Button from "@/components/ui/Button";
import {
  ImageIcon,
  LinkIcon,
  SpinnerIcon,
  TrashIcon,
  UploadIcon,
} from "@/components/ui/Icons";
import {
  ACCEPT,
  ImageError,
  encodedSize,
  fileToStorableDataUrl,
  formatBytes,
  isDataUrl,
} from "@/lib/image";


export default function ImagePicker({
  label = "Image",
  value = "",
  onChange,
  hint,
  disabled = false,
}) {
  const inputRef = useRef(null);
  const [mode, setMode] = useState(() => (isDataUrl(value) ? "file" : "url"));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);
  const [dragging, setDragging] = useState(false);

  const accept = async (file) => {
    if (!file) return;

    setBusy(true);
    setError(null);

    try {
      const result = await fileToStorableDataUrl(file);
      onChange(result.dataUrl);
      setMeta({
        name: file.name,
        from: formatBytes(file.size),
        to: formatBytes(result.bytes),
        dimensions:
          result.width && result.height
            ? `${result.width}×${result.height}`
            : null,
      });
    } catch (cause) {
      setError(
        cause instanceof ImageError
          ? cause.message
          : "That image could not be processed.",
      );
    } finally {
      setBusy(false);

      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const clear = () => {
    onChange("");
    setMeta(null);
    setError(null);
  };

  const onDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    if (disabled || busy) return;
    accept(event.dataTransfer.files?.[0]);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <span className="text-[13px] font-medium text-ink">{label}</span>

        <div
          className="flex items-center gap-0.5 rounded-lg border border-line bg-surface p-0.5"
          role="tablist"
          aria-label="How to supply the image"
        >
          <ModeTab
            active={mode === "file"}
            onClick={() => setMode("file")}
            icon={UploadIcon}
            disabled={disabled}
          >
            Upload
          </ModeTab>
          <ModeTab
            active={mode === "url"}
            onClick={() => setMode("url")}
            icon={LinkIcon}
            disabled={disabled}
          >
            URL
          </ModeTab>
        </div>
      </div>

      {value ? (
        <Preview
          value={value}
          meta={meta}
          onReplace={() => inputRef.current?.click()}
          onRemove={clear}
          disabled={disabled || busy}
        />
      ) : mode === "file" ? (
        <Dropzone
          dragging={dragging}
          busy={busy}
          disabled={disabled}
          onPick={() => inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
        />
      ) : (
        <UrlBox value={value} onChange={onChange} disabled={disabled} />
      )}

      {/* Kept mounted in both modes so Replace works on a pasted URL too. */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        tabIndex={-1}
        disabled={disabled}
        onChange={(event) => accept(event.target.files?.[0])}
      />

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

function ModeTab({ active, onClick, icon: Icon, disabled, children }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[12.5px] font-medium transition-colors disabled:opacity-50 ${
        active
          ? "bg-paper text-ink shadow-sm"
          : "text-mist hover:text-ink"
      }`}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {children}
    </button>
  );
}

function Dropzone({
  dragging,
  busy,
  disabled,
  onPick,
  onDrop,
  onDragOver,
  onDragLeave,
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      disabled={disabled || busy}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-8 text-center transition-colors disabled:cursor-not-allowed ${
        dragging
          ? "border-volt-deep bg-volt/10"
          : "border-line-strong bg-surface hover:bg-surface-2"
      }`}
    >
      {busy ? (
        <>
          <SpinnerIcon className="size-5 animate-spin text-mist" aria-hidden="true" />
          <span className="text-[13px] text-mist">Resizing…</span>
        </>
      ) : (
        <>
          <ImageIcon className="size-6 text-faint" aria-hidden="true" />
          <span className="text-[13.5px] font-medium text-ink">
            Choose a file, or drop one here
          </span>
          <span className="text-[12.5px] text-mist">
            PNG, JPEG, WebP or SVG — resized to 512px before saving
          </span>
        </>
      )}
    </button>
  );
}

function UrlBox({ value, onChange, disabled }) {
  return (
    <input
      type="url"
      // The visible label sits beside the mode tabs and belongs to neither
      // control on its own, so the name is carried here instead.
      aria-label="Image URL"
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      placeholder="https://…/paddles.jpg"
      className="h-11 w-full rounded-lg border border-line-strong bg-paper px-3.5 text-sm text-ink placeholder:text-faint transition-colors focus:border-volt-deep focus:outline-none focus:ring-2 focus:ring-volt-deep/25 disabled:bg-surface disabled:text-mist"
    />
  );
}

function Preview({ value, meta, onReplace, onRemove, disabled }) {
  const [broken, setBroken] = useState(false);
  const inline = isDataUrl(value);

  return (
    <div className="flex items-start gap-3 rounded-xl border border-line bg-surface p-3 sm:items-center sm:gap-4">
      <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-paper sm:size-20">
        {broken ? (
          <ImageIcon className="size-6 text-faint" aria-hidden="true" />
        ) : (

          <img
            src={value}
            alt=""
            className="size-full object-cover"
            onError={() => setBroken(true)}
          />
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-1">
        <p className="truncate text-[13.5px] font-medium text-ink">
          {meta?.name ?? (inline ? "Embedded image" : "Linked image")}
        </p>

        <p className="break-anywhere text-[12px] text-mist">
          {broken
            ? "This image did not load"
            : meta
              ? [meta.dimensions, `${meta.from} → ${meta.to}`]
                  .filter(Boolean)
                  .join(" · ")
              : inline
                ? `Stored inline · ${formatBytes(encodedSize(value))}`
                : value}
        </p>

        <div className="mt-1 flex flex-wrap gap-1.5">
          <Button
            tone="outline"
            size="sm"
            icon={UploadIcon}
            onClick={onReplace}
            disabled={disabled}
          >
            Replace
          </Button>
          <Button
            tone="ghost"
            size="sm"
            icon={TrashIcon}
            onClick={onRemove}
            disabled={disabled}
          >
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}
