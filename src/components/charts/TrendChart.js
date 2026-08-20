"use client";

import { useId, useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";


const WIDE = {
  w: 720,
  heights: { md: 240, sm: 170 },
  pad: { top: 14, right: 14, bottom: 26, left: 52 },
  font: 11,
};

const NARROW = {
  w: 320,
  heights: { md: 200, sm: 150 },
  pad: { top: 10, right: 8, bottom: 24, left: 42 },
  font: 12,
};

/** 0 → a nice round ceiling, so the gridlines land on readable numbers. */
function niceMax(value) {
  if (!value) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const steps = [1, 2, 2.5, 5, 10];
  return (
    magnitude * (steps.find((step) => value <= magnitude * step) ?? 10)
  );
}

export default function TrendChart({
  points,
  label,
  caption,
  height = "md",
  formatValue = (value) => String(value),
  formatTick = formatValue,
}) {
  const [hovered, setHovered] = useState(null);
  // Two charts share this page, so the gradient needs an id that cannot collide.
  const gradientId = useId();

  const geometry = useMediaQuery("(max-width: 639px)") ? NARROW : WIDE;
  const { w: W, pad: PAD, font: FONT } = geometry;
  const PLOT_W = W - PAD.left - PAD.right;

  const chartHeight = geometry.heights[height] ?? geometry.heights.md;
  const plotHeight = chartHeight - PAD.top - PAD.bottom;

  const values = points.map((point) => point.value);
  const max = niceMax(Math.max(0, ...values));

  const dense = height !== "sm" && geometry === WIDE;
  const ticks = (dense ? [0, 0.25, 0.5, 0.75, 1] : [0, 0.5, 1]).map(
    (fraction) => fraction * max,
  );

  // A single point has no line to draw, so it is pinned to the middle.
  const x = (index) =>
    PAD.left +
    (points.length > 1 ? (index / (points.length - 1)) * PLOT_W : PLOT_W / 2);

  const y = (value) => PAD.top + plotHeight - (value / max) * plotHeight;

  const line = points
    .map((point, index) => `${index ? "L" : "M"}${x(index)} ${y(point.value)}`)
    .join(" ");

  const area = `${line} L${x(points.length - 1)} ${PAD.top + plotHeight} L${x(0)} ${
    PAD.top + plotHeight
  } Z`;

  const active = hovered === null ? null : points[hovered];

 
  const labelled = new Set(
    geometry === WIDE
      ? [0, Math.floor((points.length - 1) / 2), points.length - 1]
      : [0, points.length - 1],
  );

  const onMove = (event) => {

    const clientX = event.touches?.[0]?.clientX ?? event.clientX;
    if (!Number.isFinite(clientX)) return;

    const box = event.currentTarget.getBoundingClientRect();
    if (!box.width) return;

    const ratio = (clientX - box.left) / box.width;
    const index = Math.round(ratio * (points.length - 1));
    setHovered(Math.min(points.length - 1, Math.max(0, index)));
  };

  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="flex min-w-0 items-baseline gap-2">
          <span className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-mist">
            {label}
          </span>
          {caption ? (
            <span className="text-[12px] text-faint">{caption}</span>
          ) : null}
        </span>

    
        <span className="tnum text-[13px] text-ink">
          {active ? (
            <>
              <span className="text-mist">{active.label} · </span>
              {formatValue(active.value)}
            </>
          ) : (
            <span className="text-faint">Hover to read a point</span>
          )}
        </span>
      </figcaption>

     
      <div
        className="relative w-full touch-pan-y touch-pinch-zoom"
        onMouseMove={onMove}
        onMouseLeave={() => setHovered(null)}
        onTouchStart={onMove}
        onTouchMove={onMove}
        onTouchEnd={() => setHovered(null)}
        onTouchCancel={() => setHovered(null)}
      >
        <svg
          viewBox={`0 0 ${W} ${chartHeight}`}
          className="h-auto w-full"
          role="img"
          aria-label={`${label} over ${points.length} periods`}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-volt)" stopOpacity="0.55" />
              <stop offset="100%" stopColor="var(--color-volt)" stopOpacity="0.04" />
            </linearGradient>
          </defs>

          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={y(tick)}
                y2={y(tick)}
                stroke="var(--color-line)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
              <text
                x={PAD.left - 8}
                y={y(tick) + 4}
                textAnchor="end"
                className="fill-faint"
                style={{ fontSize: FONT }}
              >
                {formatTick(tick)}
              </text>
            </g>
          ))}

          <path d={area} fill={`url(#${gradientId})`} />
          <path
            d={line}
            fill="none"
            stroke="var(--color-volt-deep)"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />

          {points.map((point, index) =>
            labelled.has(index) ? (
              <text
                key={point.label}
                x={x(index)}
                y={chartHeight - 6}
                textAnchor={
                  index === 0
                    ? "start"
                    : index === points.length - 1
                      ? "end"
                      : "middle"
                }
                className="fill-faint"
                style={{ fontSize: FONT }}
              >
                {point.label}
              </text>
            ) : null,
          )}

          {active ? (
            <g>
              <line
                x1={x(hovered)}
                x2={x(hovered)}
                y1={PAD.top}
                y2={PAD.top + plotHeight}
                stroke="var(--color-line-strong)"
                strokeWidth="1"
                strokeDasharray="3 3"
                vectorEffect="non-scaling-stroke"
              />
              {/* Ringed in the surface colour so the dot reads over the fill. */}
              <circle
                cx={x(hovered)}
                cy={y(active.value)}
                r="5"
                fill="var(--color-volt-deep)"
                stroke="var(--color-paper)"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            </g>
          ) : null}
        </svg>
      </div>

      <table className="sr-only">
        <caption>{label} by period</caption>
        <thead>
          <tr>
            <th scope="col">Period</th>
            <th scope="col">{label}</th>
          </tr>
        </thead>
        <tbody>
          {points.map((point) => (
            <tr key={point.label}>
              <th scope="row">{point.label}</th>
              <td>{formatValue(point.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
