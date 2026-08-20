"use client";

import { useId } from "react";


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
        "inline-flex items-center gap-0.5 rounded-lg border border-line bg-surface p-0.5 max-sm:w-full " +
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
              // On its own row on a phone, the options divide it between
              // them, which is both easier to hit and easier to compare.
              "grid place-items-center max-sm:flex-1 sm:block",
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
