"use client";

const TONES = {
  accent: "var(--color-volt-deep)",
  good: "var(--color-good)",
  warn: "var(--color-warn)",
  bad: "var(--color-bad)",
  info: "var(--color-info)",
  neutral: "var(--color-line-strong)",
};

const SIZE = 120;
const RADIUS = 48;
const STROKE = 16;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** A hairline of surface between segments, so two touching arcs stay apart. */
const GAP = 2;

export default function DonutChart({
  rows,
  formatValue = String,
  centerLabel,
  centerValue,
  empty = "Nothing to chart yet.",
}) {
  const total = rows.reduce((sum, row) => sum + (row.value || 0), 0);

  if (!rows.length || !total) {
    return <p className="text-[13px] text-mist">{empty}</p>;
  }

  const segments = rows.map((row, index) => {
    const share = (row.value || 0) / total;
    const length = share * CIRCUMFERENCE;
    const before = rows
      .slice(0, index)
      .reduce((sum, previous) => sum + (previous.value || 0), 0);

    return {
      ...row,
      share,
      length,
      offset: (before / total) * CIRCUMFERENCE,
      // Only carve a gap out of an arc long enough to survive losing it.
      gap: rows.length > 1 && length > GAP * 2 ? GAP : 0,
    };
  });

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-6">
      <div className="relative shrink-0">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="size-[132px]"
          role="img"
          aria-label={`${centerLabel ?? "Total"}: ${
            centerValue ?? formatValue(total)
          }`}
        >
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="var(--color-surface-2)"
            strokeWidth={STROKE}
          />

          <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
            {segments.map((segment) => (
              <circle
                key={segment.label}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke={TONES[segment.tone] ?? TONES.accent}
                strokeWidth={STROKE}
                strokeLinecap="butt"
                strokeDasharray={`${Math.max(segment.length - segment.gap, 0.5)} ${
                  CIRCUMFERENCE
                }`}
                strokeDashoffset={-segment.offset}
              />
            ))}
          </g>
        </svg>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <span className="tnum text-[17px] font-semibold leading-none tracking-[-0.02em] text-ink">
            {centerValue ?? formatValue(total)}
          </span>
          {centerLabel ? (
            <span className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-faint">
              {centerLabel}
            </span>
          ) : null}
        </div>
      </div>

      <ul className="flex w-full min-w-0 flex-1 flex-col gap-2.5">
        {segments.map((segment) => (
          <li
            key={segment.label}
            className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5"
          >
            <span
              aria-hidden="true"
              className="size-2.5 shrink-0 rounded-[3px]"
              style={{ background: TONES[segment.tone] ?? TONES.accent }}
            />
            <span className="min-w-0 flex-1 truncate text-[13px] text-ink">
              {segment.label}
            </span>
            <span className="tnum shrink-0 text-[13px] font-medium text-ink max-sm:order-last max-sm:w-full max-sm:pl-5 sm:text-right">
              {formatValue(segment.value)}
              {segment.caption ? (
                <span className="ml-1.5 text-[12px] font-normal text-mist">
                  {segment.caption}
                </span>
              ) : null}
            </span>
            <span className="tnum w-11 shrink-0 text-right text-[12px] text-faint">
              {Math.round(segment.share * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
