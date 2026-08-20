
import Badge from "@/components/ui/Badge";
import { formatNumber, formatPrice } from "@/lib/format";

const ACCENTS = {
  accent: "bg-volt",
  good: "bg-good",
  warn: "bg-warn",
  bad: "bg-bad",
  info: "bg-info",
  neutral: "bg-line-strong",
};

export default function PipelineStages({ stages, exits = [], total }) {
  return (
    <div className="flex flex-col gap-4">
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
        {stages.map((stage, index) => (
          <li
            key={stage.status}
            className="flex flex-col gap-2 rounded-lg border border-line bg-surface/60 p-2.5 sm:p-3"
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="min-w-0 truncate text-[10.5px] font-semibold uppercase tracking-[0.1em] text-mist">
                {stage.status}
              </span>
              <span className="tnum text-[10.5px] font-medium text-faint">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>

            <span className="tnum text-[1.25rem] font-semibold leading-none tracking-[-0.03em] text-ink sm:text-[1.4rem]">
              {formatNumber(stage.count)}
            </span>
            <span className="block h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
              <span
                className={`block h-full rounded-full ${ACCENTS[stage.tone] ?? ACCENTS.accent}`}
                style={{
                  width: `${total ? Math.max((stage.count / total) * 100, 2) : 0}%`,
                }}
              />
            </span>

            <span className="tnum text-[12px] text-mist">
              {formatPrice(stage.amount)}
              <span className="ml-1.5 text-faint">
                {total ? `${Math.round((stage.count / total) * 100)}%` : "0%"}
              </span>
            </span>
          </li>
        ))}
      </ol>

      {exits.length ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-faint">
            Left the flow
          </span>
          {exits.map((exit) => (
            <span key={exit.status} className="flex items-center gap-2">
              <Badge tone={exit.tone}>{exit.status}</Badge>
              <span className="tnum text-[13px] text-ink">
                {formatNumber(exit.count)}
              </span>
              <span className="tnum text-[12px] text-mist">
                {formatPrice(exit.amount)}
              </span>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
