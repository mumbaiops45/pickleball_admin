import Link from "next/link";
import { ArrowRightIcon, TrendDownIcon, TrendFlatIcon, TrendUpIcon } from "@/components/ui/Icons";
import { formatPercent } from "@/lib/format";

/**
 * One headline number, with room for the two things that make it mean
 * something: how it moved, and what share of it has landed.
 *
 * `tone` tints the icon chip only — the number itself stays ink so a row of
 * cards reads as data rather than as a row of warning lights. The one place
 * colour does carry meaning is the delta chip, and there it is paired with an
 * arrow and a signed number, so the direction survives without the hue.
 *
 * Whether a rise is good is not something the card can infer: revenue climbing
 * is good, out-of-stock lines climbing is not. `deltaGoodWhen` says which.
 */
const TONES = {
  neutral: "bg-surface-2 text-mist",
  accent: "bg-volt/30 text-volt-deep",
  good: "bg-good-tint text-good",
  warn: "bg-warn-tint text-warn",
  bad: "bg-bad-tint text-bad",
};

const METERS = {
  neutral: "bg-line-strong",
  accent: "bg-volt-deep",
  good: "bg-good",
  warn: "bg-warn",
  bad: "bg-bad",
};

const DELTAS = {
  good: "bg-good-tint text-good",
  bad: "bg-bad-tint text-bad",
  flat: "bg-surface-2 text-mist",
};

export default function StatCard({
  label,
  value,
  caption,
  icon: Icon,
  tone = "neutral",
  href,
  loading = false,
  delta,
  deltaGoodWhen = "up",
  meter,
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="flex items-center gap-1 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-mist">
          {label}
          {href ? (
            <ArrowRightIcon
              className="size-3.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
              aria-hidden="true"
            />
          ) : null}
        </p>
        {Icon ? (
          <span
            className={`grid size-9 shrink-0 place-items-center rounded-lg ${TONES[tone]}`}
          >
            <Icon className="size-[18px]" aria-hidden="true" />
          </span>
        ) : null}
      </div>

      {loading ? (
        <div className="mt-3.5 h-9 w-24 animate-pulse rounded bg-surface-2" />
      ) : (
        <div className="mt-3.5 flex flex-wrap items-end gap-x-2.5 gap-y-1.5">
          <p className="tnum text-[2.1rem] font-semibold leading-none tracking-[-0.035em] text-ink">
            {value}
          </p>
          {delta ? <Delta {...delta} goodWhen={deltaGoodWhen} /> : null}
        </div>
      )}

      {caption ? (
        <p className="mt-2.5 text-[12.5px] leading-snug text-mist">{caption}</p>
      ) : null}

      {meter && !loading ? <Meter {...meter} /> : null}
    </>
  );

  const classes =
    "group relative flex min-h-[9.5rem] flex-col rounded-xl border border-line bg-paper p-5 " +
    "shadow-[0_1px_2px_rgb(15_17_21/0.03)] transition-[border-color,box-shadow] duration-150";

  if (href) {
    return (
      <Link
        href={href}
        className={`${classes} hover:border-line-strong hover:shadow-[0_2px_8px_rgb(15_17_21/0.06)]`}
      >
        {body}
      </Link>
    );
  }

  return <div className={classes}>{body}</div>;
}

/**
 * A signed percentage with an arrow. `null`/`undefined` renders nothing rather
 * than a misleading 0% — a missing comparison is not a flat one.
 */
function Delta({ value, label, goodWhen = "up" }) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) {
    return null;
  }

  const number = Number(value);
  const direction = number > 0 ? "up" : number < 0 ? "down" : "flat";
  const tone =
    direction === "flat" ? "flat" : direction === goodWhen ? "good" : "bad";

  const Icon =
    direction === "up" ? TrendUpIcon : direction === "down" ? TrendDownIcon : TrendFlatIcon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[12px] font-semibold ${DELTAS[tone]}`}
      title={label}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      <span className="tnum">{formatPercent(number)}</span>
      <span className="sr-only">{label ? ` ${label}` : ""}</span>
    </span>
  );
}

/** Progress of a part towards its whole — collected revenue, mostly. */
function Meter({ value, max, label, tone = "accent" }) {
  const ratio = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0;

  return (
    <div className="mt-auto flex flex-col gap-1.5 pt-4">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[11.5px] text-mist">{label}</span>
        <span className="tnum text-[11.5px] font-semibold text-ink">
          {Math.round(ratio * 100)}%
        </span>
      </div>
      <span className="block h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
        <span
          className={`block h-full rounded-full ${METERS[tone] ?? METERS.accent}`}
          style={{ width: `${ratio * 100}%` }}
        />
      </span>
    </div>
  );
}
