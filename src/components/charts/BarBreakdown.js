"use client";

/**
 * Ranked horizontal bars — status splits, category share, payment methods.
 *
 * Horizontal rather than vertical because the labels are words ("PROCESSING",
 * "Paddles & gear"), and a horizontal bar gives every one of them a full line
 * to sit on instead of a rotated stub under an axis.
 *
 * Every row is labelled and carries its own number, so the bar is a second
 * encoding of something already written down — the colour is never the only
 * thing separating two rows. `tone` is the panel's reserved status palette;
 * rows without one share the single accent hue, which is correct for a
 * magnitude comparison.
 */

const TONES = {
  accent: "bg-volt",
  good: "bg-good",
  warn: "bg-warn",
  bad: "bg-bad",
  info: "bg-info",
  neutral: "bg-line-strong",
};

export default function BarBreakdown({ rows, formatValue = String, empty }) {
  const max = Math.max(0, ...rows.map((row) => row.value));

  if (!rows.length) {
    return <p className="text-[13px] text-mist">{empty}</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {rows.map((row) => (
        <li key={row.label} className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate text-[13px] text-ink">{row.label}</span>
            <span className="tnum shrink-0 text-[13px] font-medium text-ink">
              {formatValue(row.value)}
              {row.caption ? (
                <span className="ml-2 text-[12px] font-normal text-mist">
                  {row.caption}
                </span>
              ) : null}
            </span>
          </div>

          {/* The track is the empty half of the comparison, so it stays a
              surface tint rather than a second data colour. */}
          <span className="block h-2 w-full overflow-hidden rounded-full bg-surface-2">
            <span
              className={`block h-full rounded-full ${TONES[row.tone] ?? TONES.accent}`}
              style={{ width: `${max ? Math.max((row.value / max) * 100, 2) : 0}%` }}
            />
          </span>
        </li>
      ))}
    </ul>
  );
}
