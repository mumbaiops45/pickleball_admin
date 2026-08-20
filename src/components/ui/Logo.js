import Link from "next/link";

const MARK = { sm: "size-7", md: "size-9", lg: "size-11" };
const GLYPH = { sm: "size-4", md: "size-5", lg: "size-6" };

const TONES = {
  volt: "bg-volt text-ink",
  ink: "bg-ink text-volt",
  outline: "border border-line-strong bg-paper text-ink",
};


export function LogoMark({ size = "md", tone = "volt", className = "" }) {
  return (
    <span
      className={`grid ${MARK[size]} shrink-0 place-items-center rounded-lg ${TONES[tone]} ${className}`}
    >
      <svg viewBox="0 0 24 24" className={GLYPH[size]} aria-hidden="true">
        <path d="M12 3 19 13 12 17 5 13Z" fill="currentColor" />
        <rect x="10.6" y="16" width="2.8" height="6" rx="1.4" fill="currentColor" />
      </svg>
    </span>
  );
}

export default function Logo({
  size = "md",
  tone = "volt",
  href = "/dashboard",
  dark = false,
  className = "",
}) {
  const content = (
    <>
      <LogoMark size={size} tone={tone} />
      <span className="flex min-w-0 flex-col">
        <span
          className={`text-[14px] font-semibold leading-none tracking-[0.2em] ${
            dark ? "text-paper" : "text-ink"
          }`}
        >
          PADDLEHAUS
        </span>
        <span
          className={`mt-1 text-[10px] font-medium uppercase leading-none tracking-[0.28em] ${
            dark ? "text-volt" : "text-volt-deep"
          }`}
        >
          Admin
        </span>
      </span>
    </>
  );

  const classes = `flex items-center gap-3 ${className}`;

  if (!href) return <span className={classes}>{content}</span>;

  return (
    <Link href={href} className={`${classes} rounded-lg`}>
      {content}
    </Link>
  );
}
