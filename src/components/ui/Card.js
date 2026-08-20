
export default function Card({
  title,
  subtitle,
  action,
  icon: Icon,
  footer,
  padded = true,
  className = "",
  children,
}) {
  return (
    <section
      className={`flex flex-col rounded-xl border border-line bg-paper shadow-[0_1px_2px_rgb(15_17_21/0.03)] ${className}`}
    >
      {title || action ? (

        <header className="flex flex-col gap-3 border-b border-line px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:px-5">
          <div className="flex min-w-0 items-start gap-3">
            {Icon ? (
              <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-surface-2 text-mist">
                <Icon className="size-4" aria-hidden="true" />
              </span>
            ) : null}
            <div className="flex min-w-0 flex-col gap-0.5">
              <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
                {title}
              </h2>
              {subtitle ? (
                <p className="text-[13px] leading-snug text-mist">{subtitle}</p>
              ) : null}
            </div>
          </div>
          {action ? <div className="min-w-0 shrink-0">{action}</div> : null}
        </header>
      ) : null}

      <div className={`min-w-0 flex-1 ${padded ? "p-4 sm:p-5" : ""}`}>
        {children}
      </div>

      {footer ? (
        <footer className="border-t border-line px-4 py-3 text-[12.5px] text-mist sm:px-5">
          {footer}
        </footer>
      ) : null}
    </section>
  );
}
