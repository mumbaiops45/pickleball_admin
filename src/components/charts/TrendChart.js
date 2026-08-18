"use client";

import { useState } from "react";

/**
 * One measure over time: filled area, 2px line, hover crosshair.
 *
 * Deliberately one series per chart. Revenue and order count live on different
 * scales, and a second y-axis would let the two lines cross wherever the axes
 * happened to be scaled — so the dashboard draws them as two charts sharing an
 * x-axis instead.
 *
 * The SVG is drawn in a fixed 720×240 user-space box and scaled by CSS, so the
 * geometry never has to be measured in JavaScript. Strokes carry
 * `vector-effect="non-scaling-stroke"` so a wide container does not fatten the
 * line, and the readout is HTML above the SVG rather than <text> inside it, so
 * it stays at the page's font size at every width.
 *
 * A visually-hidden table carries the same numbers for screen readers and for
 * anyone who cannot separate the fill from the surface.
 */

const W = 720;
const H = 240;
const PAD = { top: 14, right: 14, bottom: 26, left: 52 };

const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

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
  formatValue = (value) => String(value),
  formatTick = formatValue,
}) {
  const [hovered, setHovered] = useState(null);

  const values = points.map((point) => point.value);
  const max = niceMax(Math.max(0, ...values));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((fraction) => fraction * max);

  // A single point has no line to draw, so it is pinned to the middle.
  const x = (index) =>
    PAD.left +
    (points.length > 1 ? (index / (points.length - 1)) * PLOT_W : PLOT_W / 2);

  const y = (value) => PAD.top + PLOT_H - (value / max) * PLOT_H;

  const line = points
    .map((point, index) => `${index ? "L" : "M"}${x(index)} ${y(point.value)}`)
    .join(" ");

  const area = `${line} L${x(points.length - 1)} ${PAD.top + PLOT_H} L${x(0)} ${
    PAD.top + PLOT_H
  } Z`;

  const active = hovered === null ? null : points[hovered];

  // First, middle and last only — every label collides below ~8 buckets wide.
  const labelled = new Set([0, Math.floor((points.length - 1) / 2), points.length - 1]);

  const onMove = (event) => {
    const box = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - box.left) / box.width;
    const index = Math.round(ratio * (points.length - 1));
    setHovered(Math.min(points.length - 1, Math.max(0, index)));
  };

  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="flex items-baseline justify-between gap-4">
        <span className="text-[12px] font-medium uppercase tracking-[0.14em] text-mist">
          {label}
        </span>
        <span className="tnum text-[13px] text-ink">
          {active ? (
            <>
              <span className="text-mist">{active.label} · </span>
              {formatValue(active.value)}
            </>
          ) : (
            <span className="text-mist">Hover for a day</span>
          )}
        </span>
      </figcaption>

      <div
        className="relative w-full"
        onMouseMove={onMove}
        onMouseLeave={() => setHovered(null)}
        onTouchStart={onMove}
        onTouchMove={onMove}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full"
          role="img"
          aria-label={`${label} over ${points.length} periods`}
        >
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
                className="fill-faint text-[11px]"
                style={{ fontSize: 11 }}
              >
                {formatTick(tick)}
              </text>
            </g>
          ))}

          <path d={area} fill="var(--color-volt)" opacity="0.22" />
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
                y={H - 6}
                textAnchor={
                  index === 0
                    ? "start"
                    : index === points.length - 1
                      ? "end"
                      : "middle"
                }
                className="fill-faint"
                style={{ fontSize: 11 }}
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
                y2={PAD.top + PLOT_H}
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
