/**
 * Enum pill. Tone names match the status maps in the services
 * (`ORDER_STATUS_TONE`, `PAYMENT_STATUS_TONE`) so a status never needs a
 * colour decision at the call site.
 */
const TONES = {
  neutral: "bg-surface-2 text-mist",
  good: "bg-good-tint text-good",
  warn: "bg-warn-tint text-warn",
  bad: "bg-bad-tint text-bad",
  info: "bg-info-tint text-info",
  accent: "bg-volt/25 text-volt-deep",
};

export default function Badge({
  tone = "neutral",
  dot = false,
  className = "",
  children,
}) {
  return (
    <span
      // an unmapped enum value still has to render as *something* legible
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11.5px] font-medium uppercase tracking-[0.06em] ${TONES[tone] ?? TONES.neutral} ${className}`}
    >
      {dot ? (
        <span
          className="size-1.5 rounded-full bg-current"
          aria-hidden="true"
        />
      ) : null}
      {children}
    </span>
  );
}

/** Product `status` enum: DRAFT / PUBLISHED / ARCHIVED. */
export const PRODUCT_STATUS_TONE = {
  PUBLISHED: "good",
  DRAFT: "warn",
  ARCHIVED: "neutral",
};

/** Stock is a number, but reads as a status. */
export function stockTone(stock) {
  if (!stock) return "bad";
  if (stock <= 5) return "warn";
  return "good";
}
