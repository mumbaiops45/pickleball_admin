import Link from "next/link";

/**
 * One number with a label. `tone` tints the icon chip only — the number stays
 * ink so a row of cards reads as data rather than as a warning light, and the
 * meaning is carried by the caption underneath.
 */
const TONES = {
  neutral: "bg-surface-2 text-mist",
  accent: "bg-volt/30 text-volt-deep",
  good: "bg-good-tint text-good",
  warn: "bg-warn-tint text-warn",
  bad: "bg-bad-tint text-bad",
};

export default function StatCard({
  label,
  value,
  caption,
  icon: Icon,
  tone = "neutral",
  href,
  loading = false,
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-mist">
          {label}
        </p>
        {Icon ? (
          <span className={`grid size-9 place-items-center rounded-lg ${TONES[tone]}`}>
            <Icon className="size-[18px]" aria-hidden="true" />
          </span>
        ) : null}
      </div>

      {loading ? (
        <div className="mt-3 h-9 w-20 animate-pulse rounded bg-surface-2" />
      ) : (
        <p className="tnum mt-3 text-[2rem] font-semibold leading-none tracking-[-0.03em] text-ink">
          {value}
        </p>
      )}

      {caption ? (
        <p className="mt-2 text-[12.5px] leading-snug text-mist">{caption}</p>
      ) : null}
    </>
  );

  const classes =
    "flex flex-col rounded-xl border border-line bg-paper p-5 transition-colors";

  if (href) {
    return (
      <Link href={href} className={`${classes} hover:border-line-strong`}>
        {body}
      </Link>
    );
  }

  return <div className={classes}>{body}</div>;
}
