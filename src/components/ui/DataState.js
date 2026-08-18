"use client";

import Button from "@/components/ui/Button";
import {
  RefreshIcon,
  SpinnerIcon,
  WarnIcon,
} from "@/components/ui/Icons";

/**
 * The loading / error / empty triad, in one component so every screen reports
 * the same way.
 *
 * A 501 is treated as its own state rather than an error: it means the screen
 * is finished but the API route it needs does not exist yet, and the hint the
 * service attached names the endpoint to add.
 */
export default function DataState({
  loading,
  error,
  isEmpty = false,
  onRetry,
  rows = 4,
  emptyTitle = "Nothing here yet",
  emptyBody,
  emptyAction,
  children,
}) {
  if (loading) return <Skeleton rows={rows} />;

  if (error?.status === 501) {
    return (
      <Notice
        tone="info"
        title={error.message}
        body={error.data?.hint}
        footnote="Everything above this point — service, hook and screen — is already wired for it."
      />
    );
  }

  if (error) {
    return (
      <Notice
        tone="bad"
        title={
          error.isNetworkError ? "Cannot reach the API" : "Something went wrong"
        }
        body={error.message}
        action={
          onRetry ? (
            <Button tone="outline" size="sm" icon={RefreshIcon} onClick={onRetry}>
              Try again
            </Button>
          ) : null
        }
      />
    );
  }

  if (isEmpty) {
    return <Notice title={emptyTitle} body={emptyBody} action={emptyAction} />;
  }

  return children;
}

export function Skeleton({ rows = 4 }) {
  return (
    <div className="flex flex-col gap-2" role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="h-14 animate-pulse rounded-lg bg-surface-2"
          // a staggered pulse reads as loading rather than as a broken layout
          style={{ animationDelay: `${index * 90}ms` }}
        />
      ))}
    </div>
  );
}

export function Spinner({ label = "Loading", className = "" }) {
  return (
    <span className={`inline-flex items-center gap-2 text-mist ${className}`}>
      <SpinnerIcon className="size-4 animate-spin" aria-hidden="true" />
      <span className="text-sm">{label}</span>
    </span>
  );
}

const NOTICE_TONES = {
  neutral: "border-line bg-paper text-mist",
  info: "border-info/25 bg-info-tint text-info",
  bad: "border-bad/25 bg-bad-tint text-bad",
};

export function Notice({
  tone = "neutral",
  title,
  body,
  footnote,
  action,
  children,
}) {
  return (
    <div
      className={`flex flex-col items-start gap-3 rounded-xl border p-6 ${NOTICE_TONES[tone]}`}
    >
      <div className="flex items-start gap-3">
        {tone === "neutral" ? null : (
          <WarnIcon className="mt-0.5 size-[18px] shrink-0" aria-hidden="true" />
        )}
        <div className="flex flex-col gap-1.5">
          {title ? (
            <p className="text-sm font-semibold text-ink">{title}</p>
          ) : null}
          {body ? <p className="text-[13.5px] leading-relaxed">{body}</p> : null}
          {footnote ? (
            <p className="text-[12.5px] text-mist">{footnote}</p>
          ) : null}
        </div>
      </div>
      {children}
      {action}
    </div>
  );
}

/** Inline form-level error, for the message under a submit button. */
export function FormError({ error }) {
  if (!error) return null;

  return (
    <p
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-bad/25 bg-bad-tint px-3 py-2.5 text-[13px] text-bad"
    >
      <WarnIcon className="mt-px size-4 shrink-0" aria-hidden="true" />
      <span>{error.message ?? String(error)}</span>
    </p>
  );
}
