"use client";


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
            <span className="min-w-0 flex-1 truncate text-[13px] text-ink">
              {row.label}
            </span>
            <span className="tnum shrink-0 text-[13px] font-medium text-ink">
              {formatValue(row.value)}
              {row.caption ? (
                <span className="ml-2 text-[12px] font-normal text-mist">
                  {row.caption}
                </span>
              ) : null}
            </span>
          </div>

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
