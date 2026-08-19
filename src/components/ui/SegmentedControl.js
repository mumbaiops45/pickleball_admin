"use client";

import { useId } from "react";

/**
 * A small set of mutually exclusive choices, shown all at once.
 *
 * Used instead of a <Select> where the options are few, short and worth
 * comparing at a glance — a date range on a chart, mainly. A dropdown hides
 * the alternatives behind a click and reads as a form control; a card header
 * wants a control that looks like a toggle, not like an input.
 *
 * Built on real radios rather than buttons with `role="radio"`, so arrow-key
 * navigation, the focus ring and form semantics come from the browser. The
 * inputs are visually hidden but still focusable, and the label carries the
 * highlight.
 */
export default function SegmentedControl({
  options,
  value,
  onChange,
  name,
  label,
  className = "",
}) {
  const generated = useId();
  const group = name ?? generated;

  return (
    <div
      aria-label={label}
      className={
        "inline-flex items-center gap-0.5 rounded-lg border border-line bg-surface p-0.5 " +
        `has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-volt-deep ${className}`
      }
    >
      {options.map((option) => {
        const active = option.value === value;

        return (
          <label
            key={option.value}
            title={option.title}
            className={[
              "cursor-pointer select-none rounded-[7px] px-2.5 py-1.5 text-[12.5px] font-medium",
              "transition-colors duration-150",
              active
                ? "bg-paper text-ink shadow-[0_1px_2px_rgb(15_17_21/0.08)]"
                : "text-mist hover:text-ink",
            ].join(" ")}
          >
            <input
              type="radio"
              name={group}
              value={option.value}
              checked={active}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.label}
          </label>
        );
      })}
    </div>
  );
}
