import Link from "next/link";
import { SpinnerIcon } from "@/components/ui/Icons";

/**
 * One button, three tones and two sizes. Renders an `<a>` when given `href`
 * so a navigation and an action can look identical without a wrapper.
 */
const TONES = {
  primary:
    "bg-ink text-paper hover:bg-shell-2 disabled:bg-ink/40 disabled:text-paper/70",
  accent:
    "bg-volt text-ink hover:brightness-95 disabled:bg-volt/50 disabled:text-ink/50",
  outline:
    "border border-line-strong bg-paper text-ink hover:bg-surface disabled:text-mist",
  ghost: "text-mist hover:bg-surface-2 hover:text-ink disabled:text-faint",
  danger:
    "border border-bad/30 bg-bad-tint text-bad hover:bg-bad hover:text-paper disabled:opacity-50",
};

const SIZES = {
  sm: "h-9 gap-1.5 px-3 text-[13px]",
  md: "h-11 gap-2 px-4 text-sm",
  lg: "h-12 gap-2 px-6 text-[15px]",
};

export default function Button({
  as,
  href,
  tone = "primary",
  size = "md",
  type = "button",
  loading = false,
  disabled = false,
  icon: Icon,
  className = "",
  children,
  ...rest
}) {
  const classes = [
    "inline-flex shrink-0 items-center justify-center rounded-lg font-medium",
    "transition-colors duration-150 disabled:cursor-not-allowed",
    TONES[tone],
    SIZES[size],
    className,
  ].join(" ");

  const content = (
    <>
      {loading ? (
        <SpinnerIcon className="size-4 animate-spin" aria-hidden="true" />
      ) : Icon ? (
        <Icon className="size-4" aria-hidden="true" />
      ) : null}
      {children}
    </>
  );

  if (href) {
    const Tag = as ?? Link;
    return (
      <Tag href={href} className={classes} {...rest}>
        {content}
      </Tag>
    );
  }

  return (
    <button
      type={type}
      // aria-busy tells a screen reader the press was registered; without it
      // the swapped-in spinner is silent.
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={classes}
      {...rest}
    >
      {content}
    </button>
  );
}
