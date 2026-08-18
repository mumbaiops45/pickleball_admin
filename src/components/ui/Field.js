"use client";

import { useId, useState } from "react";
import { EyeIcon, EyeOffIcon } from "@/components/ui/Icons";

const CONTROL =
  "w-full rounded-lg border bg-paper px-3.5 text-sm text-ink placeholder:text-faint " +
  "transition-colors focus:border-volt-deep focus:outline-none focus:ring-2 focus:ring-volt-deep/25 " +
  "disabled:bg-surface disabled:text-mist";

/**
 * Label + control + hint/error, wired together by a generated id.
 *
 * The error is rendered in the same node the input points at with
 * `aria-describedby`, so it is announced on focus rather than only seen.
 */
export function Field({
  label,
  hint,
  error,
  required = false,
  htmlFor,
  children,
}) {
  const describedBy = error ? `${htmlFor}-error` : hint ? `${htmlFor}-hint` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label
          htmlFor={htmlFor}
          className="text-[13px] font-medium text-ink"
        >
          {label}
          {required ? (
            <span className="ml-0.5 text-bad" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
      ) : null}

      {children({ id: htmlFor, describedBy, invalid: Boolean(error) })}

      {error ? (
        <p id={`${htmlFor}-error`} className="text-[12.5px] text-bad">
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="text-[12.5px] text-mist">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function TextInput({
  label,
  hint,
  error,
  required,
  id,
  className = "",
  ...rest
}) {
  const generated = useId();
  const inputId = id ?? generated;

  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      required={required}
      htmlFor={inputId}
    >
      {({ describedBy, invalid }) => (
        <input
          id={inputId}
          required={required}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          className={`h-11 ${CONTROL} ${
            invalid ? "border-bad" : "border-line-strong"
          } ${className}`}
          {...rest}
        />
      )}
    </Field>
  );
}

/** Same field, with a show/hide toggle that keeps the input mounted. */
export function PasswordInput({
  label = "Password",
  hint,
  error,
  required,
  id,
  ...rest
}) {
  const generated = useId();
  const inputId = id ?? generated;
  const [visible, setVisible] = useState(false);

  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      required={required}
      htmlFor={inputId}
    >
      {({ describedBy, invalid }) => (
        <div className="relative">
          <input
            id={inputId}
            type={visible ? "text" : "password"}
            required={required}
            aria-describedby={describedBy}
            aria-invalid={invalid || undefined}
            className={`h-11 pr-11 ${CONTROL} ${
              invalid ? "border-bad" : "border-line-strong"
            }`}
            {...rest}
          />
          <button
            type="button"
            onClick={() => setVisible((shown) => !shown)}
            aria-label={visible ? "Hide password" : "Show password"}
            className="absolute right-1 top-1 grid size-9 place-items-center rounded-md text-mist hover:bg-surface hover:text-ink"
          >
            {visible ? (
              <EyeOffIcon className="size-4" />
            ) : (
              <EyeIcon className="size-4" />
            )}
          </button>
        </div>
      )}
    </Field>
  );
}

export function Select({
  label,
  hint,
  error,
  required,
  id,
  children,
  className = "",
  ...rest
}) {
  const generated = useId();
  const selectId = id ?? generated;

  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      required={required}
      htmlFor={selectId}
    >
      {({ describedBy, invalid }) => (
        <select
          id={selectId}
          required={required}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          className={`h-11 ${CONTROL} ${
            invalid ? "border-bad" : "border-line-strong"
          } ${className}`}
          {...rest}
        >
          {children}
        </select>
      )}
    </Field>
  );
}

export function Textarea({
  label,
  hint,
  error,
  required,
  id,
  rows = 4,
  className = "",
  ...rest
}) {
  const generated = useId();
  const areaId = id ?? generated;

  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      required={required}
      htmlFor={areaId}
    >
      {({ describedBy, invalid }) => (
        <textarea
          id={areaId}
          rows={rows}
          required={required}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          className={`py-2.5 ${CONTROL} ${
            invalid ? "border-bad" : "border-line-strong"
          } ${className}`}
          {...rest}
        />
      )}
    </Field>
  );
}
